# backend/student/supabase_client.py
import requests
from django.conf import settings
from datetime import datetime

class SupabaseClient:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_SERVICE_KEY
        self.headers = {
            'apikey': self.key,
            'Authorization': f'Bearer {self.key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    def create_billing_item(self, data):
        """Create a new billing item from student submission"""
        endpoint = f"{self.url}/rest/v1/billing_items"
        
        # Add student submission timestamp
        data['created_at'] = datetime.now().isoformat()
        
        response = requests.post(endpoint, headers=self.headers, json=data)
        if response.status_code == 201:
            return response.json()[0] if response.json() else None
        else:
            print(f"Error creating billing item: {response.status_code}")
            print(f"Response: {response.text}")
        return None

# Create a singleton instance
supabase_client = SupabaseClient()