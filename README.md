# STUDENT_BILLING_FORM_SYSTEM

```
student-portal/
├── backend/
│   ├── config/ (Django settings)
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └──  wsgi.py
│   ├── student/ (Student app)
│   │   ├── urls.py
│   │   ├── supabase_client.py
│   │   └── views.py
│   ├── .env
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── static/
    │   ├── css/student.css 
    │   └── js/student.js (Form handling)
    └── templates/
        ├── student_form.html (Billing form)
        └── success.html (Success page)


```

```
cd backend
pip install -r requirements.txt
python manage.py runserver 8001

```