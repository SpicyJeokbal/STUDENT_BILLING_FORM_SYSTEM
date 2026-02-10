# backend/student/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .supabase_client import supabase_client
import json

def student_form(request):
    """Student billing form page - No login required"""
    return render(request, 'student_form.html')

@csrf_exempt
@require_POST
def submit_billing(request):
    """Submit billing form from student"""
    try:
        data = json.loads(request.body)
        print(f"\n=== STUDENT BILLING SUBMISSION ===")
        print(f"Received data: {json.dumps(data, indent=2)}")
        
        # Validate required fields
        required_fields = ['name', 'student_no', 'program', 'term', 'items', 'total']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return JsonResponse({
                'success': False, 
                'message': f"Missing required fields: {', '.join(missing_fields)}"
            }, status=400)
        
        # Get items
        items = data.get('items', [])
        if not items:
            return JsonResponse({
                'success': False, 
                'message': 'Please add at least one item'
            }, status=400)
        
        # Calculate total from all items
        total_amount = sum(item['quantity'] * item['amount'] for item in items)
        
        # Build items description
        items_description = ', '.join([f"{item['description']} (x{item['quantity']})" for item in items])
        
        # Get first item for legacy fields
        first_item = items[0]
        
        # Create billing data - goes directly to "in_progress"
        billing_data = {
            'name': data.get('name'),
            'student_no': data.get('student_no'),
            'program_year': data.get('program'),
            'term': data.get('term'),
            'school_year': data.get('academic_year') or '2025-2026',
            'date': data.get('date'),
            'quantity': first_item.get('quantity', 1),
            'description': items_description,
            'amount': first_item.get('amount', 0),
            'total': total_amount,
            'status': 'in_progress',  # Always starts in progress
            'charged_by': 'Student Submission',  # Mark as student-submitted
        }
        
        print(f"Billing data to save: {json.dumps(billing_data, indent=2)}")
        
        # Create in Supabase
        item = supabase_client.create_billing_item(billing_data)
        
        if item:
            item_id = item.get('id')
            print(f"Successfully created billing item with ID: {item_id}")
            
            return JsonResponse({
                'success': True, 
                'item_id': item_id,
                'message': 'Your billing form has been submitted successfully!'
            })
        else:
            return JsonResponse({
                'success': False, 
                'message': 'Failed to submit billing form. Please try again.'
            }, status=500)
            
    except json.JSONDecodeError as e:
        return JsonResponse({
            'success': False, 
            'message': 'Invalid form data'
        }, status=400)
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'success': False, 
            'message': 'An error occurred. Please try again.'
        }, status=500)

def success_page(request):
    """Success confirmation page"""
    return render(request, 'success.html')