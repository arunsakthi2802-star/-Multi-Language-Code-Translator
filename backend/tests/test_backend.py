import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.translators.language_registry import list_languages, get_language, detect_language
from app.providers.rule_based import RuleBasedTranslationProvider
from app.validators.validator_service import CodeValidatorService

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_system_status():
    response = client.get("/api/v1/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("online", "degraded")
    assert data["database"] == "connected"

def test_language_registry():
    languages = list_languages()
    assert len(languages) >= 20
    py = get_language("python")
    assert py is not None
    assert py.editor_mode == "python"

def test_detect_language():
    py_res = detect_language("def hello():\n    print('hi')")
    assert py_res["language"] == "python"
    assert py_res["confidence"] > 0.5

    js_res = detect_language("console.log('hello'); const x = 10;")
    assert js_res["language"] in ("javascript", "typescript")

def test_rule_based_translation():
    py_code = "print('Hello, World!')\nx = 42\nif x > 10:\n    print('Greater')"
    res = RuleBasedTranslationProvider.translate(py_code, "python", "javascript", {})
    assert "console.log('Hello, World!');" in res.translated_code
    assert "let x = 42;" in res.translated_code
    assert "if (x > 10) {" in res.translated_code

def test_code_validation_python():
    valid_code = "def add(a, b):\n    return a + b\n"
    res = CodeValidatorService.validate(valid_code, "python")
    assert res.is_valid is True
    assert len(res.diagnostics) == 0

    invalid_code = "def add(a, b\n    return a + b"
    res_inv = CodeValidatorService.validate(invalid_code, "python")
    assert res_inv.is_valid is False
    assert len(res_inv.diagnostics) > 0

def test_code_validation_javascript():
    valid_js = "function add(a, b) { return a + b; }"
    res = CodeValidatorService.validate(valid_js, "javascript")
    assert res.is_valid is True

    unbalanced_js = "function add(a, b) { return a + b;"
    res_inv = CodeValidatorService.validate(unbalanced_js, "javascript")
    assert res_inv.is_valid is False

def test_user_auth_flow():
    email = f"tester_{pytest.__name__}@example.com"
    reg_payload = {
        "name": "Test Engineer",
        "email": email,
        "password": "StrongPassword123!"
    }
    # Register
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    if reg_res.status_code == 400: # in case email exists
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": "StrongPassword123!"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
    else:
        assert reg_res.status_code == 200
        token = reg_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # Get Me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email

    # Project CRUD
    proj_payload = {
        "name": "Integration Project",
        "description": "Testing project flow",
        "source_language": "python",
        "target_language": "javascript",
        "source_code": "print('hello')",
        "translated_code": "console.log('hello');",
        "notes": "Verified",
        "tags": "test,unit"
    }
    p_create = client.post("/api/v1/projects", json=proj_payload, headers=headers)
    assert p_create.status_code == 200
    p_id = p_create.json()["id"]

    # List Projects
    p_list = client.get("/api/v1/projects", headers=headers)
    assert p_list.status_code == 200
    assert any(p["id"] == p_id for p in p_list.json())

    # Delete Project
    p_del = client.delete(f"/api/v1/projects/{p_id}", headers=headers)
    assert p_del.status_code == 200

def test_templates_api():
    res = client.get("/api/v1/templates")
    assert res.status_code == 200
    templates = res.json()
    assert len(templates) > 0
    assert any("Hello World" in t["title"] for t in templates)
