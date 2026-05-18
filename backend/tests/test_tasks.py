def test_create_task(client):
    # Register and login
    client.post(
        "/api/v1/auth/register",
        json={"email": "task@example.com", "username": "taskuser", "password": "password123"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "taskuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    
    # Create task
    response = client.post(
        "/api/v1/tasks/",
        json={"title": "Test Task", "description": "Test Description"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"

def test_get_user_tasks_only(client):
    # User 1
    client.post("/api/v1/auth/register", json={"email": "u1@ex.com", "username": "u1", "password": "password123"})
    u1_login = client.post("/api/v1/auth/login", data={"username": "u1", "password": "password123"})
    u1_token = u1_login.json()["access_token"]
    
    # User 2
    client.post("/api/v1/auth/register", json={"email": "u2@ex.com", "username": "u2", "password": "password123"})
    u2_login = client.post("/api/v1/auth/login", data={"username": "u2", "password": "password123"})
    u2_token = u2_login.json()["access_token"]
    
    # U1 creates task
    client.post("/api/v1/tasks/", json={"title": "U1 Task"}, headers={"Authorization": f"Bearer {u1_token}"})
    
    # U2 gets tasks (should be empty)
    response = client.get("/api/v1/tasks/", headers={"Authorization": f"Bearer {u2_token}"})
    assert response.status_code == 200
    assert len(response.json()) == 0
    
    # U1 gets tasks (should have 1)
    response = client.get("/api/v1/tasks/", headers={"Authorization": f"Bearer {u1_token}"})
    assert len(response.json()) == 1

def test_task_filtering(client):
    # Register and login
    client.post("/api/v1/auth/register", json={"email": "filter@ex.com", "username": "filteruser", "password": "password123"})
    login_res = client.post("/api/v1/auth/login", data={"username": "filteruser", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create an active task
    client.post("/api/v1/tasks/", json={"title": "Active Task", "is_completed": False}, headers=headers)
    
    # Create a completed task
    completed_res = client.post("/api/v1/tasks/", json={"title": "Completed Task", "is_completed": True}, headers=headers)
    
    # Get all tasks (should be 2)
    res_all = client.get("/api/v1/tasks/", headers=headers)
    assert len(res_all.json()) == 2
    
    # Get completed tasks only (should be 1)
    res_completed = client.get("/api/v1/tasks/?completed=true", headers=headers)
    assert len(res_completed.json()) == 1
    assert res_completed.json()[0]["title"] == "Completed Task"
    
    # Get incomplete tasks only (should be 1)
    res_incomplete = client.get("/api/v1/tasks/?completed=false", headers=headers)
    assert len(res_incomplete.json()) == 1
    assert res_incomplete.json()[0]["title"] == "Active Task"

def test_task_pagination(client):
    # Register and login
    client.post("/api/v1/auth/register", json={"email": "page@ex.com", "username": "pageuser", "password": "password123"})
    login_res = client.post("/api/v1/auth/login", data={"username": "pageuser", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create 5 tasks
    for i in range(1, 6):
        client.post("/api/v1/tasks/", json={"title": f"Task {i}"}, headers=headers)
        
    # Get limit=2, skip=0 (should return the latest 2 tasks: Task 5 and Task 4, since they are order_by id.desc())
    res_page1 = client.get("/api/v1/tasks/?limit=2&skip=0", headers=headers)
    assert len(res_page1.json()) == 2
    assert res_page1.json()[0]["title"] == "Task 5"
    assert res_page1.json()[1]["title"] == "Task 4"
    
    # Get limit=2, skip=2 (should return next 2 tasks: Task 3 and Task 2)
    res_page2 = client.get("/api/v1/tasks/?limit=2&skip=2", headers=headers)
    assert len(res_page2.json()) == 2
    assert res_page2.json()[0]["title"] == "Task 3"
    assert res_page2.json()[1]["title"] == "Task 2"
