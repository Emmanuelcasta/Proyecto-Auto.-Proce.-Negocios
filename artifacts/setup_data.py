import httpx
from datetime import date

BASE_URL = "http://localhost:8000/api/v1"

def setup_data():
    client = httpx.Client()
    
    # 1. Login
    print("--- Autenticando...")
    login_res = client.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@sysclock.com", "password": "Admin123!"}
    )
    if login_res.status_code != 200:
        print(f"Error login: {login_res.text}")
        return
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Employees
    print("\n--- Creando empleados...")
    empleados = [
        {"nombre": "Carlos Ramírez", "documento": "1018224501", "salario": 1423500},
        {"nombre": "Juan Torres", "documento": "80234509", "salario": 1500000},
        {"nombre": "María Gómez", "documento": "1020456789", "salario": 1600000}
    ]
    created_ids = []
    
    for emp in empleados:
        # Check if already exists by calling list first
        res = client.get(f"{BASE_URL}/empleados", headers=headers)
        existing = res.json().get("empleados", [])
        found = [e for e in existing if e["documento"] == emp["documento"]]
        
        if found:
            print(f"Empleado {emp['nombre']} ya existe.")
            created_ids.append(found[0]["id"])
        else:
            create_res = client.post(f"{BASE_URL}/empleados", json=emp, headers=headers)
            if create_res.status_code == 201:
                print(f"Empleado creado: {emp['nombre']}")
                created_ids.append(create_res.json()["id"])
            else:
                print(f"Error al crear {emp['nombre']}: {create_res.text}")

    if len(created_ids) < 3:
        print("No se pudieron obtener 3 empleados para el ciclo.")
        return

    # 3. Create Shift Rotation Cycle
    print("\n--- Creando ciclo de rotación...")
    cycle_data = {
        "fecha_inicio_ciclo": "2026-05-18",  # Monday, May 18, 2026
        "empleado_a_id": created_ids[0],
        "empleado_b_id": created_ids[1],
        "empleado_c_id": created_ids[2]
    }
    
    # Check if a cycle is already active
    cycle_res = client.get(f"{BASE_URL}/turnos/ciclo", headers=headers)
    if cycle_res.status_code == 200:
        print("Ya existe un ciclo de rotación activo.")
        print(cycle_res.json())
    else:
        create_cycle = client.post(f"{BASE_URL}/turnos/ciclo", json=cycle_data, headers=headers)
        if create_cycle.status_code == 201:
            print("¡Ciclo de rotación creado con éxito!")
            print(create_cycle.json())
        else:
            print(f"Error al crear ciclo: {create_cycle.text}")

    # 4. Verify Week Shifting
    print("\n--- Verificando turnos de la semana...")
    week_res = client.get(f"{BASE_URL}/turnos/semana?fecha=2026-05-18", headers=headers)
    print(f"Turnos semana: {week_res.status_code}")
    print(week_res.json())

if __name__ == "__main__":
    setup_data()
