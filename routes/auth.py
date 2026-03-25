from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

# Simular una base de datos temporal para almacenar usuarios
usuarios_db = []


class CredencialesRequest(BaseModel):
    correo: str
    contraseña: str


@router.post("/register")
def registro(credenciales: CredencialesRequest):
    nuevo_usuario = {
        "correo": credenciales.correo,
        "contraseña": credenciales.contraseña
    }
    usuarios_db.append(nuevo_usuario)
    return {
        "mensaje": "¡Registro exitoso!",
        "datos": nuevo_usuario
    }


@router.post("/login")
def login(credenciales: CredencialesRequest):
    # Buscar el usuario en la lista temporal
    usuario_encontrado = next(
        (u for u in usuarios_db if u["correo"] == credenciales.correo),
        None
    )
    
    if usuario_encontrado and usuario_encontrado["contraseña"] == credenciales.contraseña:
        return {
            "mensaje": "¡Login exitoso!",
            "datos": {
                "correo": usuario_encontrado["correo"]
            }
        }
    else:
        return {
            "mensaje": "Credenciales inválidas",
            "datos": {"correo": credenciales.correo}
        }
