# Fix Migration Issue

When you see this prompt:
```
It is impossible to add the field 'created_at' with 'auto_now_add=True' to event without providing a default.
1) Provide a one-off default now which will be set on all existing rows
2) Quit and manually define a default value in models.py.
Select an option:
```

**Select option 1** and press Enter.

Then when it asks for the default value, type:
```
timezone.now
```

And press Enter.

This will set the current timestamp for all existing rows.

## Quick Command

Or run this (it will automatically select option 1):
```bash
cd django_backend
echo 1 | python manage.py makemigrations
```

Then when prompted for the default, type: `timezone.now`

## After Migration

Once migrations are created, run:
```bash
python manage.py migrate
```

