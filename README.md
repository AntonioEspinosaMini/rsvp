# Nuestra boda — confirmación de asistencia

El sitio que reciben los invitados. Una sola página: cada uno abre **su**
enlace (`https://<dominio>/?t=<token>`), dice si viene, deja lo que haga falta
(alergias, transporte, la canción que no puede faltar) y, debajo, se encuentra
el plan del día, los hoteles con los que hemos hablado y dónde arreglarse.

Sin login y sin registro: el enlace **es** la credencial.

## Por qué esto es un repositorio aparte

Este sitio existe para que la página del invitado **no** viva en el mismo
dominio que el gestor privado de la boda (repo `nalitos`: presupuesto,
proveedores, tareas, la lista entera de invitados, el plano de mesas).

El enlace de RSVP se reparte a trescientas personas, así que su URL deja de ser
un secreto en cuanto sale el primer WhatsApp. Mientras la página vivía dentro
del gestor, bastaba borrar el `?t=…` de la barra del navegador para aterrizar
en el presupuesto de la boda — y, como el bundle del gestor lleva dentro la
Access Key de JSONBin, no solo para mirarlo: también para escribir.

Separarlos rompe esa cadena: el enlace del invitado ya no dice dónde vive el
gestor, y este sitio, aunque se inspeccione entero, no sabe decirlo — no tiene
dentro ni una URL, ni una clave, ni un nombre de bin del otro lado.

> **Lo que esto NO hace.** El gestor sigue protegido por que nadie sepa su URL,
> no por una contraseña. Lo que se gana es que el enlace del invitado deje de
> ser la pista. Ver "Lo que queda pendiente", al final.

## Cómo encaja con el gestor

Los dos repos comparten **una sola cosa**: la colección `rsvps` de Firestore,
un documento por invitado con el `rsvp_token` de id.

```
GESTOR (repo nalitos)                            ESTE SITIO (público)
─────────────────────────────────────            ────────────────────
1. Da de alta al invitado y le genera
   un rsvp_token aleatorio.
2. ensureGuestDoc(token, {nombre})  ──────►  rsvps/{token}
                                              { first_name, last_name }
3. Copia el enlace y lo manda.                     │
                                                   ▼
                                             4. El invitado abre
                                                /?t=<token>, lee su
                                                documento y responde.
                                             5. submitRsvp(token, …)
                                                escribe la respuesta
                                                con pending: true
                                                   │
6. El gestor ve pending: true, ◄───────────────────┘
   importa la respuesta a su JSON
   y hace clearPending(token).
```

El gestor **crea** el documento; este sitio lo **rellena**; el gestor lo
**importa**. Ninguno de los dos llama al otro: hablan por Firestore y nada más.

### El contrato

La forma del documento (`RsvpAnswer` y `RsvpDoc`, en `lib/rsvp-store.ts`) es
una interfaz entre dos repositorios. Añadir, renombrar o quitar un campo
**obliga a tocar y desplegar los dos**.

| Campo | Lo escribe | Para qué |
| --- | --- | --- |
| `first_name`, `last_name` | el gestor | saludar al invitado por su nombre |
| `status` | el invitado | `confirmado` / `no_viene` |
| `allergies`, `transport`, `song_request`, `notes` | el invitado | lo que pide |
| `pending` | los dos | `true` al responder, `false` cuando el gestor lo importa |
| `updated_at` | el invitado | ISO, para saber qué es nuevo |

Cada lado lleva solo los métodos que usa: aquí `getRsvp` y `submitRsvp`; en el
gestor, `ensureGuestDoc` y `clearPending`. Los **tipos** sí están duplicados a
propósito, y ese bloque va marcado en los dos archivos como `CONTRATO
COMPARTIDO`. Duplicar cuatro interfaces cuesta menos que montar y versionar un
paquete npm compartido para una boda que dura un año.

## Puesta en marcha

```bash
npm install
cp .env.local.example .env.local   # y rellenar (ver abajo)
npm run dev                        # http://localhost:3000
```

Para ver algo hace falta un token de verdad: abre
`http://localhost:3000/?t=<token>` con el `rsvp_token` de un invitado que ya
exista en Firestore. Sin `?t=`, o con un token que no está, la página enseña
"este enlace no funciona" — que es justo lo que debe.

### Firebase

Los tres valores de `.env.local` son **los mismos** que los del gestor: el
mismo proyecto, la misma base de datos, la misma colección. Si no, este sitio
escribiría en un sitio que el gestor no lee y las respuestas no llegarían a
ninguna parte.

```text
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Esta config **sí está pensada para ser pública** (al contrario que la Access
Key de JSONBin del gestor): en Firebase el control de acceso vive en las reglas
de seguridad, no en ocultar el `apiKey`. Las reglas, que se editan en la
consola de Firebase y valen para los dos repos, son estas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvps/{token} {
      allow get, update: if true; // hace falta conocer el token exacto
      allow create: if request.resource.data.keys().hasOnly([
        'first_name', 'last_name', 'status', 'allergies', 'transport',
        'song_request', 'notes', 'pending', 'updated_at'
      ]);
      allow list, delete: if false; // nunca se puede enumerar ni borrar
    }
  }
}
```

Lo que protege a un invitado de otro es que `allow list` esté en `false` y que
el token sea aleatorio: sin poder enumerar la colección, conocer un documento
exige conocer su token exacto. Por eso en la URL va el **token**, nunca el `id`
interno del invitado.

## Qué se edita

**`lib/wedding-info.ts`** — todo el contenido: los nombres y la fecha
(`WEDDING`) y cuatro listas (`TIMELINE`, `HOTELS`, `HAIR_SALONS`, `BARBERS`)
con nombre, nota, descuento pactado, teléfono, dirección y web de cada sitio.

Una lista vacía (`[]`) **esconde su sección entera** y las demás se renumeran
solas, así que se puede publicar con lo que haya cerrado e ir añadiendo el
resto. Es estático a propósito: son cuatro listas que se tocan tres veces en
toda la boda; meterlas en Firestore pedía una colección pública nueva y
pantallas de edición en el gestor. Se edita, se hace commit, y GitHub Actions
lo publica.

> Ojo: el archivo se entrega con entradas de ejemplo (`EJEMPLO — sustituir`).
> Cámbialas antes de repartir los enlaces.

## Cómo está hecha la página

Es la única pantalla que ven trescientas personas que no son los novios, así
que tiene lenguaje propio: una sola columna sobre un fondo cálido con manchas
de color que se mueven muy despacio, secciones numeradas separadas por líneas
de un píxel (no hay tarjetas), la serif de la casa a tamaño grande y etiquetas
monoespaciadas.

El movimiento es todo CSS —`opacity` y `transform`, nada que provoque
*layout*— y no entra ni un kilobyte de librería de animación en el bundle. Los
bloques aparecen al llegar a la pantalla desde un único registro compartido
(`components/motion.tsx`) con un solo listener de scroll a `rAF`, en lugar de
un `IntersectionObserver` por bloque: el observador solo avisa cuando la
intersección **cambia**, y con un scroll rápido o un salto a un ancla un bloque
puede pasar de estar debajo de la pantalla a estar encima en el mismo
fotograma — nunca interseca, nunca llega el aviso y se queda invisible para
siempre. Todo respeta `prefers-reduced-motion`.

```
app/
  layout.tsx        html/body, fuentes y el noindex
  page.tsx          la página entera: estados, secciones y orden
  globals.css       solo lo que Tailwind no puede expresar (grano, cursiva)
components/
  form.tsx          el formulario y el estado de "gracias"
  motion.tsx        revelado al hacer scroll, colapsables, barra de progreso
  places.tsx        hoteles, peluquerías, barberías
  shell.tsx         fondo, contenedor y cabecera de sección
  timeline.tsx      el día hora a hora
lib/
  rsvp-store.ts     Firestore + EL CONTRATO con el gestor
  wedding-info.ts   el contenido (esto es lo que se edita)
  utils.ts          cn()
```

## Despliegue

`git push` a `main` → GitHub Actions construye y publica en GitHub Pages
(`.github/workflows/deploy.yml`).

Antes hay que dejar puestos, en **Settings → Secrets and variables → Actions**,
los tres secrets de Firebase (los mismos del gestor):
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_APP_ID`. Y en **Settings → Pages**, *Source: GitHub
Actions*.

### El dominio propio

El sitio pasa por dos etapas y `next.config.js` distingue entre ellas él solo,
mirando si existe `public/CNAME`:

1. **Sin dominio todavía** — se publica en `usuario.github.io/<repo>/` y el
   build añade el `basePath` que eso necesita. Funciona, y los enlaces ya se
   pueden repartir.
2. **Con dominio** — crea `public/CNAME` con una sola línea (`nuestraboda.es`,
   sin `https://` ni barras; hay un `public/CNAME.example` al lado), ponlo
   también en **Settings → Pages → Custom domain**, y apunta el DNS del
   dominio a GitHub Pages. Al existir ese archivo, el build deja de meter
   `basePath` y el sitio pasa a servirse en la raíz.

No hay ningún tercer sitio donde acordarse de tocar nada: el `CNAME` es a la
vez lo que GitHub necesita y la señal que lee el build.

**Al cambiar de la etapa 1 a la 2**, acuérdate de actualizar
`NEXT_PUBLIC_RSVP_BASE_URL` en el repo del gestor (es el secret con el que
construye el enlace que copias), o seguirá repartiendo la URL vieja.

### La URL, más bonita

Con GitHub Pages el enlace es `https://nuestraboda.es/?t=x7g2`, porque Pages no
sabe reescribir rutas. Si algún día molesta, moviendo el hosting a Cloudflare
Pages o Vercel y añadiendo un `_redirects` con `/* /index.html 200` pasaría a
ser `https://nuestraboda.es/x7g2`. No merece la pena antes de repartir nada.

## Lo que queda pendiente

- **El gestor sigue sin puerta.** Esto le quita el cartel de la entrada, pero
  quien dé con su URL entra igual. Mientras el repositorio del gestor sea
  público, su nombre está a la vista en el perfil de GitHub y la URL de Pages
  se deduce de él. La solución de verdad es ponerle una contraseña al gestor (o
  hacer el repo privado, que en GitHub Pages exige cuenta Pro).
- **El `projectId` de Firebase va en este bundle** — no hay forma de evitarlo,
  viaja en cada petición a Firestore. Hoy coincide con el nombre del repo del
  gestor, así que lo delata: conviene que el repo del gestor pase a llamarse de
  otra forma.
- **Un invitado puede escribir en su propio documento lo que quiera**, no solo
  lo que pone el formulario — incluido `pending: false`, que haría que el
  gestor no importase su respuesta. Es inherente a que no haya servidor: las
  reglas de Firestore acotan *qué documento*, no *qué contenido*. Como el
  único perjudicado sería él mismo, se asume.
- **Se duplica código** con el gestor (`rsvp-store.ts`, la paleta de Tailwind,
  las fuentes) y los dos repos irán separándose. Para una boda que dura un
  año es la respuesta correcta; un paquete compartido cuesta más de lo que
  ahorra.
- **Si algún día se restringe la API key de Firebase por *referrer* HTTP** (en
  la consola de Google Cloud), hay que añadir este dominio a la lista, o los
  invitados dejarán de poder responder.
