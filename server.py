import json
import os
import math
import re
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("qaLabMcp")


@mcp.tool()
def validar_cliente(cip: str, telefono: str, email: str) -> str:
    """Valida y normaliza datos de un cliente: CIP, telefono y email."""
    errores = []

    cip = cip.strip()
    if not cip.isdigit() or len(cip) < 4:
        errores.append("CIP invalido: debe ser numerico de al menos 4 digitos")

    telefono = re.sub(r"[^\d]", "", telefono)
    if len(telefono) < 7:
        errores.append("Telefono invalido: debe tener al menos 7 digitos")
    else:
        telefono = f"{telefono[:4]}-{telefono[4:]}"

    email = email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        errores.append("Email invalido: formato incorrecto")

    if errores:
        return f"ERROR: {'; '.join(errores)}"

    return json.dumps({
        "valido": True,
        "cip": cip,
        "telefono": telefono,
        "email": email
    }, indent=2, ensure_ascii=False)


@mcp.tool()
def generar_caso_prueba(endpoint: str, metodo: str, escenario: str) -> str:
    """Genera un caso de prueba funcional basado en endpoint, metodo y escenario."""
    casos = {
        "credenciales invalidas": {
            "titulo": f"Validar {metodo} {endpoint} con credenciales invalidas",
            "descripcion": "Verificar que el endpoint rechaza credenciales incorrectas",
            "precondicion": "Usuario registrado con credenciales conocidas",
            "datos_entrada": '{"username": "invalido", "password": "incorrecto"}',
            "resultado_esperado": "HTTP 401 Unauthorized",
            "tipo": "Seguridad - Autenticacion"
        },
        "datos vacios": {
            "titulo": f"Validar {metodo} {endpoint} con datos vacios",
            "descripcion": "Verificar que el endpoint maneja correctamente datos vacios",
            "precondicion": "Endpoint disponible",
            "datos_entrada": "{}",
            "resultado_esperado": "HTTP 400 Bad Request",
            "tipo": "Funcional - Validacion"
        },
        "payload valido": {
            "titulo": f"Validar {metodo} {endpoint} con payload valido",
            "descripcion": "Verificar flujo exitoso con datos correctos",
            "precondicion": "Datos de prueba disponibles",
            "datos_entrada": "{\"campo\": \"valor_valido\"}",
            "resultado_esperado": "HTTP 200 OK o 201 Created",
            "tipo": "Funcional - Flujo Feliz"
        }
    }

    escenario_key = escenario.strip().lower()
    if escenario_key in casos:
        caso = casos[escenario_key]
    else:
        caso = {
            "titulo": f"Validar {metodo} {endpoint} - {escenario}",
            "descripcion": f"Caso de prueba para escenario: {escenario}",
            "precondicion": "No especificada",
            "datos_entrada": "Depende del escenario",
            "resultado_esperado": "Por determinar",
            "tipo": "Funcional - Personalizado"
        }

    resultado = {
        "endpoint": endpoint,
        "metodo": metodo.upper(),
        "escenario": escenario,
        "caso_prueba": caso
    }
    return json.dumps(resultado, indent=2, ensure_ascii=False)


@mcp.tool()
def calcular_percentil_simple(valores: list, percentil: float) -> str:
    """Calcula un percentil simple de una lista de valores numericos."""
    if not valores:
        return "ERROR: La lista de valores no puede estar vacia"
    if percentil < 0 or percentil > 100:
        return "ERROR: El percentil debe estar entre 0 y 100"

    n = len(valores)
    ordenados = sorted(valores)
    indice = (percentil / 100) * (n - 1)
    idx_inferior = int(math.floor(indice))
    idx_superior = int(math.ceil(indice))

    if idx_inferior == idx_superior:
        valor = ordenados[idx_inferior]
    else:
        fraccion = indice - idx_inferior
        valor = ordenados[idx_inferior] + fraccion * (ordenados[idx_superior] - ordenados[idx_inferior])

    return json.dumps({
        "valores_ordenados": ordenados,
        "percentil": percentil,
        "resultado": round(valor, 2),
        "n": n
    }, indent=2, ensure_ascii=False)


@mcp.tool()
def clasificar_error_http(status_code: int) -> str:
    """Clasifica un codigo de estado HTTP en su categoria."""
    if 100 <= status_code <= 199:
        return "Informativo"
    elif 200 <= status_code <= 299:
        return "Exito"
    elif 300 <= status_code <= 399:
        return "Redireccion"
    elif 400 <= status_code <= 499:
        return "Error del cliente"
    elif 500 <= status_code <= 599:
        return "Error del servidor"
    else:
        return f"Codigo desconocido: {status_code}"


@mcp.tool()
def evaluar_sla(p95_ms: float, limite_ms: float) -> str:
    """Evalua si un P95 cumple con el limite de SLA."""
    diferencia = round(limite_ms - p95_ms, 2)
    cumple = p95_ms <= limite_ms
    estado = "cumple" if cumple else "no cumple"

    return json.dumps({
        "p95_ms": p95_ms,
        "limite_ms": limite_ms,
        "diferencia_ms": diferencia,
        "cumple": cumple,
        "mensaje": f"El P95 de {p95_ms}ms {estado} con el limite de {limite_ms}ms (diferencia: {diferencia}ms)"
    }, indent=2, ensure_ascii=False)


@mcp.tool()
def validar_respuesta_api(status_code: int, tiempo_ms: float, limite_ms: float, tiene_token: bool) -> str:
    """Valida una respuesta de API: status 2xx, tiempo dentro de limite, token presente."""
    errores = []

    if 200 <= status_code <= 299:
        status_ok = True
    else:
        status_ok = False
        errores.append(f"Status code {status_code} no es 2xx")

    tiempo_ok = tiempo_ms <= limite_ms
    if not tiempo_ok:
        errores.append(f"Tiempo {tiempo_ms}ms excede el limite de {limite_ms}ms")

    if not tiene_token:
        errores.append("No hay token de autenticacion")

    valido = len(errores) == 0
    resultado = {
        "valido": valido,
        "status_code": status_code,
        "status_ok": status_ok,
        "tiempo_ms": tiempo_ms,
        "limite_ms": limite_ms,
        "tiempo_ok": tiempo_ok,
        "tiene_token": tiene_token,
        "errores": errores
    }

    return json.dumps(resultado, indent=2, ensure_ascii=False)


@mcp.tool()
def buscar_cliente(cip: str) -> str:
    """Busca un cliente por CIP en datos_prueba.json."""
    ruta = os.path.join(os.path.dirname(__file__), "datos_prueba.json")

    if not os.path.exists(ruta):
        return f"ERROR: Archivo datos_prueba.json no encontrado en {ruta}"

    try:
        with open(ruta, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return "ERROR: El archivo datos_prueba.json no tiene formato JSON valido"

    clientes = data if isinstance(data, list) else data.get("clientes", [])

    for cliente in clientes:
        if str(cliente.get("cip", "")) == cip.strip():
            return json.dumps(cliente, indent=2, ensure_ascii=False)

    return json.dumps({
        "encontrado": False,
        "cip_buscado": cip.strip(),
        "mensaje": f"No se encontro ningun cliente con CIP {cip.strip()}"
    }, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    mcp.run(transport="stdio")
