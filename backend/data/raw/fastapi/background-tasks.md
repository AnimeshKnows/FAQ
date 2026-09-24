---
title: FastAPI Background Tasks
url: https://fastapi.tiangolo.com/tutorial/background-tasks/
---

# Background Tasks

You can define background tasks to run after returning a response.

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def write_notification(email: str, message: str = ""):
    with open("log.txt", mode="a") as email_file:
        content = f"notification for {email}: {message}\n"
        email_file.write(content)


@app.post("/send-notification/{email}")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_notification, email, message="Hello")
    return {"message": "Notification sent in the background"}
```

Background tasks are useful for email sending, file processing, and other work that should not block the response.
