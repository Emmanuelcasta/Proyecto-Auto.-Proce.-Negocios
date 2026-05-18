import httpx

BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    client = httpx.Client()
    
    # 1. Login
    print("--- Autenticando...")
    try:
        login_res = client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@sysclock.com", "password": "Admin123!"}
        )
        print(f"Login Status: {login_res.status_code}")
        if login_res.status_code != 200:
            print(login_res.text)
            return
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"Error en login: {e}")
        return

    # 2. Get Empleados
    print("\n--- GET /empleados...")
    try:
        res = client.get(f"{BASE_URL}/empleados", headers=headers)
        print(f"Status: {res.status_code}")
        print(res.text[:500])
    except Exception as e:
        print(f"Error: {e}")

    # 3. Get Turnos Semana
    print("\n--- GET /turnos/semana?fecha=2026-05-17...")
    try:
        res = client.get(f"{BASE_URL}/turnos/semana?fecha=2026-05-17", headers=headers)
        print(f"Status: {res.status_code}")
        print(res.text[:500])
    except Exception as e:
        print(f"Error: {e}")

    # 4. Get Turnos Ciclo
    print("\n--- GET /turnos/ciclo...")
    try:
        res = client.get(f"{BASE_URL}/turnos/ciclo", headers=headers)
        print(f"Status: {res.status_code}")
        print(res.text[:500])
    except Exception as e:
        print(f"Error: {e}")

    # 5. Get Configuración
    print("\n--- GET /configuracion...")
    try:
        res = client.get(f"{BASE_URL}/configuracion", headers=headers)
        print(f"Status: {res.status_code}")
        print(res.text[:500])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_flow()
