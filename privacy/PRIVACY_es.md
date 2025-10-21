# Política de Privacidad

**Última actualización: 21 de octubre de 2025**

---

## Introducción

Gracias por usar "Cache Cleaner Assistant" (en adelante "esta Extensión"). Nos tomamos muy en serio su privacidad y la seguridad de sus datos. Esta Política de Privacidad está diseñada para ayudarle a comprender cómo esta Extensión recopila, usa, almacena y protege su información.

**Compromiso importante: Esta Extensión no recopila, almacena ni transmite ninguna información de identificación personal a servidores externos. Todo el procesamiento de datos se realiza localmente en su dispositivo.**

---

## 1. Recopilación de Información

### 1.1 Información que NO Recopilamos

Esta Extensión **NO** recopila ninguna de la siguiente información:

- ❌ Información de identificación personal (nombre, correo electrónico, teléfono, etc.)
- ❌ Historial de navegación
- ❌ Datos de visitas a sitios web
- ❌ Contenido de cookies
- ❌ Datos de formularios
- ❌ Contraseñas o credenciales de inicio de sesión
- ❌ Información de geolocalización
- ❌ Identificadores de dispositivo
- ❌ Direcciones IP

### 1.2 Datos Almacenados Localmente

Esta Extensión solo almacena la siguiente información de configuración localmente en su navegador para proporcionar una experiencia personalizada:

| Tipo de Datos                   | Propósito                                      | Ubicación de Almacenamiento |
| ------------------------------- | ---------------------------------------------- | --------------------------- |
| Preferencia de Idioma           | Recordar el idioma de interfaz elegido         | Almacenamiento local        |
| Configuración de Tema           | Guardar selección de tema oscuro/claro         | Almacenamiento local        |
| Configuración de Notificaciones | Recordar estado activado/desactivado           | Almacenamiento local        |
| Opciones de Limpieza            | Guardar sus preferencias de limpieza           | Almacenamiento local        |
| Programación Automática         | Almacenar configuración de limpieza automática | Almacenamiento local        |

**Estos datos solo se almacenan en su dispositivo y nunca se cargan en ningún servidor.**

---

## 2. Explicación de Permisos

Esta Extensión requiere los siguientes permisos del navegador para proporcionar funcionalidad básica. Prometemos usar estos permisos solo para los propósitos declarados:

### 2.1 Permisos Requeridos

| Permiso            | Propósito                                            | Método de Procesamiento de Datos                       |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| `storage`          | Guardar configuraciones del usuario                  | Solo almacenamiento local, no se carga                 |
| `browsingData`     | Borrar caché, cookies y otros datos de navegación    | Solo realiza eliminación, no lee contenido             |
| `tabs`             | Obtener información de la pestaña actual             | Solo lee dominio URL, no registra URL completa         |
| `activeTab`        | Ejecutar operaciones de recarga en la pestaña actual | Solo activa actualización, no accede al contenido      |
| `downloads`        | Borrar historial de descargas                        | Solo realiza eliminación, no accede a archivos         |
| `history`          | Borrar historial de navegación                       | Solo realiza eliminación, no lee historial             |
| `cookies`          | Borrar cookies de sitios web                         | Solo realiza eliminación, no lee valores               |
| `unlimitedStorage` | Almacenar configuraciones del usuario (sin límite)   | Solo almacena configuraciones, no recopila información |
| `contextMenus`     | Agregar acciones rápidas al menú contextual          | Solo proporciona opciones de menú, no recopila datos   |
| `notifications`    | Mostrar notificaciones de finalización de operación  | Solo muestra localmente, no envía externamente         |
| `scripting`        | Ejecutar scripts de limpieza en páginas              | Solo borra LocalStorage/SessionStorage                 |
| `<all_urls>`       | Permitir operaciones de limpieza en todos los sitios | Solo usado para limpieza, no accede al contenido       |

### 2.2 Principios de Uso de Permisos

- ✅ **Principio de Mínimo Privilegio**: Solo solicita permisos necesarios para implementar funcionalidad
- ✅ **Uso Transparente**: Todos los propósitos de permisos están claramente explicados en este documento
- ✅ **Procesamiento Local**: Todo el procesamiento de datos se completa localmente
- ✅ **Sin Abuso de Permisos**: No usa permisos para ningún propósito más allá de lo declarado

---

## 3. Uso de Datos

### 3.1 Métodos de Procesamiento de Datos

Todas las funciones de esta Extensión se ejecutan en su dispositivo local:

1. **Limpieza de Caché**: Llama directamente a la API del navegador para eliminar caché, no lee contenido
2. **Limpieza de Cookies**: Elimina cookies directamente, no lee ni registra valores
3. **Limpieza de Almacenamiento**: Borra LocalStorage y SessionStorage, no accede al contenido
4. **Limpieza de Historial**: Elimina historial de navegación, no lee ni registra datos
5. **Recarga de Página**: Activa actualización de página, no accede al contenido

### 3.2 Operaciones que NO Realizamos

Esta Extensión **NUNCA**:

- ❌ Enviará sus datos a servidores externos
- ❌ Compartirá su información con terceros
- ❌ Rastreará su comportamiento de navegación
- ❌ Analizará sus hábitos de uso
- ❌ Mostrará anuncios o realizará marketing
- ❌ Venderá o alquilará sus datos

---

## 4. Seguridad de Datos

### 4.1 Medidas de Seguridad

Tomamos las siguientes medidas para proteger la seguridad de sus datos:

- 🔒 **Almacenamiento Local**: Todos los datos se almacenan solo en su dispositivo
- 🔒 **Sin Transmisión de Red**: La extensión no contiene código de solicitud de red
- 🔒 **Sin Dependencias Externas**: No depende de servicios de terceros o CDN
- 🔒 **Transparencia de Código Abierto**: El código fuente es público y disponible para revisión
- 🔒 **Aislamiento de Permisos**: Sigue mecanismos de sandbox de seguridad del navegador

### 4.2 Eliminación de Datos

Puede eliminar todos los datos almacenados por esta Extensión en cualquier momento mediante los siguientes métodos:

1. **Desinstalar la Extensión**: Todas las configuraciones locales se eliminarán automáticamente después de la desinstalación
2. **Restablecer Configuraciones**: Haga clic en "Restaurar Configuración Predeterminada" en la configuración de la extensión
3. **Borrar Datos del Navegador**: Borre los datos de la extensión a través de la configuración del navegador

---

## 5. Servicios de Terceros

### 5.1 Sin Servicios de Terceros

Esta Extensión **NO usa NINGÚN servicio de terceros**, incluyendo pero no limitado a:

- ❌ Servicios de análisis (como Google Analytics)
- ❌ Redes publicitarias
- ❌ Servicios de almacenamiento en la nube
- ❌ Plugins de redes sociales
- ❌ Servicios de seguimiento de errores

### 5.2 Sin Conexiones Externas

Esta Extensión **NO establece NINGUNA conexión de red externa**:

- ❌ No se conecta a nuestros servidores
- ❌ No se conecta a APIs de terceros
- ❌ No carga recursos externos
- ❌ No envía datos de telemetría

---

## 6. Privacidad de los Niños

Esta Extensión no recopila intencionalmente ninguna información de niños menores de 13 años. De hecho, esta Extensión no recopila ninguna información personal de ningún usuario, lo que la hace adecuada para usuarios de todas las edades.

---

## 7. Usuarios Internacionales

Esta Extensión se proporciona a nivel mundial y admite múltiples idiomas. Sin importar dónde se encuentre, nuestro compromiso de protección de privacidad es consistente:

- 🌍 **Aplicable Globalmente**: La política de privacidad se aplica a usuarios de todas las regiones
- 🌍 **Cumplimiento Normativo**: Cumple con regulaciones de privacidad como GDPR y CCPA
- 🌍 **Procesamiento Local**: Todo el procesamiento de datos se completa en su dispositivo local
- 🌍 **Sin Transferencia Transfronteriza**: No involucra ninguna transferencia de datos transfronteriza

---

## 8. Actualizaciones de la Política de Privacidad

### 8.1 Notificaciones de Actualización

Podemos actualizar esta Política de Privacidad de vez en cuando. Si hay cambios significativos, le notificaremos mediante los siguientes métodos:

1. Nota en la descripción de actualización de la extensión
2. Mostrar notificación en la interfaz de la extensión
3. Publicar anuncio en la página del proyecto de GitHub

### 8.2 Fecha de Vigencia

Las actualizaciones de esta Política de Privacidad entrarán en vigencia inmediatamente después de la publicación. El uso continuo de esta Extensión indica su aceptación de la Política de Privacidad actualizada.

---

## 9. Derechos del Usuario

### 9.1 Sus Derechos

Como usuario, tiene los siguientes derechos:

- ✅ **Derecho de Acceso**: Ver todos los datos de configuración almacenados por esta Extensión
- ✅ **Derecho de Modificación**: Modificar su configuración y preferencias en cualquier momento
- ✅ **Derecho de Eliminación**: Eliminar todos los datos almacenados localmente en cualquier momento
- ✅ **Derecho de Rechazo**: Elegir no usar ciertas funciones
- ✅ **Derecho a Saber**: Comprender cómo se usan los datos

### 9.2 Ejercicio de Derechos

Puede ejercer los derechos anteriores mediante los siguientes métodos:

1. **En la Configuración de la Extensión**: Modificar o restablecer configuraciones directamente
2. **Desinstalar la Extensión**: Eliminar completamente todos los datos
3. **Contáctenos**: Si tiene preguntas, contáctenos a través de la información de contacto a continuación

---

## 10. Compromiso de Código Abierto

### 10.1 Transparencia del Código

Esta Extensión es completamente de código abierto:

- 📖 **Código Fuente Público**: [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)
- 📖 **Revisable**: Cualquiera puede revisar el código para verificar los compromisos de privacidad
- 📖 **Supervisión de la Comunidad**: Los miembros de la comunidad son bienvenidos a informar cualquier problema de privacidad

### 10.2 Auditoría y Verificación

Damos la bienvenida a investigadores de seguridad y defensores de la privacidad para auditar esta Extensión:

- 🔍 Revisar el código fuente para verificar que no hay recopilación de datos
- 🔍 Verificar el tráfico de red para confirmar que no hay conexiones externas
- 🔍 Analizar el uso de permisos para garantizar un cumplimiento razonable

---

## 11. Contáctenos

Si tiene alguna pregunta, comentario o sugerencia sobre esta Política de Privacidad, contáctenos mediante los siguientes métodos:

### 📧 Información de Contacto

- **Correo electrónico**: somuns.os@qq.com
- **GitHub Issues**: [https://github.com/soyof/clearCache/issues](https://github.com/soyof/clearCache/issues)
- **Página Principal del Proyecto**: [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)

### ⏱️ Tiempo de Respuesta

Responderemos a su consulta dentro de los 7 días hábiles posteriores a su recepción.

---

## 12. Declaración de Derechos de Autor

### 12.1 Licencia de Código Abierto

Esta Extensión es de código abierto bajo la **Licencia MIT**. Es libre de usar, modificar y distribuir esta Extensión.

### 12.2 Requisitos de Atribución

Si usa, modifica o hace referencia al código o documentación de esta Extensión en su proyecto, cumpla con los siguientes requisitos:

- ✅ **Conservar Aviso de Derechos de Autor**: Conserve la Licencia MIT original y la información de derechos de autor
- ✅ **Citar la Fuente**: Reconozca la fuente en la documentación de su proyecto
- ✅ **Formato de Citación**: Recomendamos usar el siguiente formato

```
Este proyecto se basa en "Cache Cleaner Assistant"
Autor Original: soyof
URL del Proyecto: https://github.com/soyof/clearCache
Licencia: MIT License
```

### 12.3 Descargo de Responsabilidad

Esta Extensión se proporciona "tal cual" sin ninguna garantía expresa o implícita. Al usar esta Extensión para limpiar datos, asegúrese de comprender las consecuencias de la operación. No somos responsables de ninguna pérdida de datos u otras pérdidas resultantes del uso de esta Extensión.

---

## 13. Resumen de Protección de Privacidad

### ✅ Nuestros Compromisos

| Compromiso                             | Descripción                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| 🔒 **Cero Recopilación de Datos**      | No recopila ninguna información de identificación personal |
| 🔒 **Procesamiento Local**             | Todas las operaciones completadas en su dispositivo        |
| 🔒 **Sin Transmisión de Red**          | No envía datos a ningún servidor                           |
| 🔒 **Sin Terceros**                    | No usa ningún servicio de terceros                         |
| 🔒 **Transparencia de Código Abierto** | El código fuente es completamente público y revisable      |
| 🔒 **Permisos Razonables**             | Solo solicita permisos necesarios, sin abuso               |

### 🎯 Principios Fundamentales

1. **Privacidad Primero**: La privacidad del usuario es nuestra máxima prioridad
2. **Transparente y Abierto**: Todos los métodos de procesamiento de datos son transparentes y abiertos
3. **Principio de Minimización**: Solo recopilar y procesar datos necesarios
4. **Control del Usuario**: Los usuarios tienen control completo sobre sus datos
5. **Garantía de Seguridad**: Tomar medidas apropiadas para proteger la seguridad de los datos

---

## 14. Preguntas Frecuentes (FAQ)

### P1: ¿Esta Extensión recopila mi historial de navegación?

**R:** No. Esta Extensión solo eliminará el historial de navegación cuando lo solicite explícitamente, y no lee ni recopila contenido del historial.

### P2: ¿Esta Extensión lee mis cookies?

**R:** No. Esta Extensión solo eliminará cookies cuando solicite limpieza, y no lee ni registra contenido de cookies.

### P3: ¿Se cargarán mis datos de configuración en servidores?

**R:** No. Todos los datos de configuración solo se almacenan en su navegador local y nunca se cargarán.

### P4: ¿Esta Extensión requiere conexión a Internet?

**R:** No. Esta Extensión funciona completamente sin conexión y no requiere ninguna conexión de red.

### P5: ¿Cómo puedo verificar los compromisos de privacidad de esta Extensión?

**R:** Puede:

1. Ver el código de código abierto: [https://github.com/soyof/clearCache](https://github.com/soyof/clearCache)
2. Usar herramientas de desarrollo del navegador para monitorear solicitudes de red (encontrará que no hay solicitudes externas)
3. Verificar registros de uso de permisos del navegador

### P6: ¿Los datos permanecerán después de desinstalar la Extensión?

**R:** No. Después de desinstalar la Extensión, todos los datos de configuración almacenados localmente se eliminarán automáticamente.

### P7: ¿Esta Extensión cumple con GDPR?

**R:** Sí. Dado que esta Extensión no recopila ningún dato personal, cumple completamente con GDPR y otras regulaciones de privacidad.

---

## 15. Historial de Versiones

| Versión | Fecha      | Cambios             |
| ------- | ---------- | ------------------- |
| 1.0     | 2025-10-21 | Lanzamiento inicial |

---

<div align="center">
  <p><strong>Gracias por confiar en "Cache Cleaner Assistant"</strong></p>
  <p><i>Su Privacidad, Nuestra Responsabilidad</i></p>
  <p>© 2025 Cache Cleaner Assistant | MIT License</p>
</div>

---

**Esta Política de Privacidad se actualizó por última vez el: 21 de octubre de 2025**
