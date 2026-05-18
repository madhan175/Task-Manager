from app.auth import get_password_hash, verify_password

password = "mypassword123"
hashed = get_password_hash(password)
print(f"Hashed: {hashed}")

is_valid = verify_password(password, hashed)
print(f"Is valid: {is_valid}")

is_invalid = verify_password("wrongpassword", hashed)
print(f"Is invalid (wrong password): {is_invalid}")
