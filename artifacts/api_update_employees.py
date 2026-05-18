import httpx

BASE_URL = "http://localhost:8000/api/v1"

def update_via_api():
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
    print("Autenticación exitosa.")

    # 2. Obtener empleados activos y eliminarlos
    print("\n--- Obteniendo y eliminando empleados anteriores...")
    res_list = client.get(f"{BASE_URL}/empleados", headers=headers)
    if res_list.status_code == 200:
        empleados = res_list.json().get("empleados", [])
        print(f"Se encontraron {len(empleados)} empleados.")
        for emp in empleados:
            del_res = client.delete(f"{BASE_URL}/empleados/{emp['id']}", headers=headers)
            if del_res.status_code == 200:
                print(f"Empleado desactivado/eliminado: {emp['nombre']} (ID: {emp['id']})")
            else:
                print(f"Error al eliminar {emp['nombre']}: {del_res.text}")
    else:
        print(f"Error al listar empleados: {res_list.text}")

    # 3. Crear los nuevos empleados con salario mínimo ($1.423.500)
    print("\n--- Creando nuevos empleados solicitados...")
    nuevos = [
        {"nombre": "Julian Andres Molina", "documento": "1001234567", "salario": 1423500},
        {"nombre": "Jhon Mauricio Echeverry", "documento": "1002345678", "salario": 1423500},
        {"nombre": "Juan Esteban Villa", "documento": "1003456789", "salario": 1423500}
    ]
    created_ids = []
    for data in nuevos:
        # Check if already exists in active/inactive (to be safe)
        create_res = client.post(f"{BASE_URL}/empleados", json=data, headers=headers)
        if create_res.status_code == 201:
            emp_info = create_res.json()
            print(f"Empleado creado exitosamente: {emp_info['nombre']} (ID: {emp_info['id']})")
            created_ids.append(emp_info['id'])
        else:
            print(f"Error al crear empleado {data['nombre']}: {create_res.text}")

    if len(created_ids) < 3:
        print("\nNo se pudieron crear los 3 empleados necesarios para iniciar el ciclo.")
        return

    # 4. Crear nuevo ciclo de rotación activo
    print("\n--- Estableciendo el nuevo ciclo de rotación de turnos...")
    cycle_data = {
        "fecha_inicio_ciclo": "2026-05-18", # Lunes
        "empleado_a_id": created_ids[0],
        "empleado_b_id": created_ids[1],
        "empleado_c_id": created_ids[2]
    }
    cycle_res = client.post(f"{BASE_URL}/turnos/ciclo", json=cycle_data, headers=headers)
    if cycle_res.status_code == 201:
        print("¡Nuevo ciclo de rotación de turnos establecido con éxito!")
        print(cycle_res.json())
    else:
        print(f"Error al crear ciclo de rotación: {cycle_res.text}")

    # 5. Consultar los turnos de la semana para verificar
    print("\n--- Verificando turnos asignados para la semana...")
    week_res = client.get(f"{BASE_URL}/turnos/semana?fecha=2026-05-18", headers=headers)
    if week_res.status_code == 200:
        print("Turnos asignados exitosamente:")
        print(week_res.json())
    else:
        print(f"Error al verificar turnos: {week_res.text}")

if __name__ == "__main__":
    update_via_api()
