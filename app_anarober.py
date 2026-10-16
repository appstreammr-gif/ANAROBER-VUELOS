import flet as ft
import os

def main(page: ft.Page):
    page.title = "ANAROBER — SISTEMA DE VUELOS"
    page.bgcolor = ft.colors.BLACK
    page.window_width = 400
    page.window_height = 700
    page.padding = 20
    page.scroll = ft.ScrollMode.AUTO

    titulo = ft.Text(
        "CONSOLA PRINCIPAL",
        color=ft.colors.GREY_400,
        size=22,
        font_family="Courier New",
        text_align=ft.TextAlign.CENTER
    )

    subtitulo = ft.Text(
        "ANAROBER — SISTEMA DE GESTIÓN DE VUELOS",
        color=ft.colors.GREY_600,
        size=14,
        font_family="Courier New",
        text_align=ft.TextAlign.CENTER
    )

    instruccion = ft.Text(
        "SELECCIONE EL ENCARGADO QUE CORRESPONDA",
        color=ft.colors.GREY_300,
        size=16,
        font_family="Courier New",
        text_align=ft.TextAlign.CENTER
    )

    def mostrar_dialogo(e, numero, archivo_html=None):
        def cerrar(_):
            page.dialog.open = False
            page.update()
            if archivo_html:
                ruta = os.path.join(os.path.dirname(__file__), "www", archivo_html)
                page.launch_url(ruta)

        page.dialog = ft.AlertDialog(
            title=ft.Container(
                content=ft.Text("ANAROBER - APPSTREAM 2026", color=ft.colors.WHITE, font_family="Courier New"),
                bgcolor=ft.colors.BLUE_900,
                padding=10,
                alignment=ft.alignment.center
            ),
            content=ft.Text(
                f"ESTÁ A PUNTO DE ELEGIR\nEL NÚMERO {numero}",
                color=ft.colors.BLACK,
                font_family="Courier New",
                text_align=ft.TextAlign.CENTER
            ),
            bgcolor=ft.colors.GREY_300,
            actions=[
                ft.ElevatedButton(
                    "OK",
                    on_click=cerrar,
                    bgcolor=ft.colors.BLUE_900,
                    color=ft.colors.WHITE
                )
            ]
        )
        page.dialog.open = True
        page.update()

    estilo = ft.ButtonStyle(
        color=ft.colors.GREY_400,
        bgcolor=ft.colors.TRANSPARENT,
        padding=ft.padding.symmetric(vertical=14, horizontal=12),
        shape=ft.RoundedRectangleBorder(radius=2),
        side=ft.BorderSide(1, ft.colors.GREY_700)
    )

    page.add(
        titulo,
        subtitulo,
        ft.Divider(color=ft.colors.GREY_800, height=20),
        instruccion,
        ft.Divider(color=ft.colors.TRANSPARENT, height=10),

        ft.ElevatedButton(
            "▶ CONSOLA PRINCIPAL",
            on_click=lambda e: mostrar_dialogo(e, "CONSOLA PRINCIPAL", "anarober.html"),
            style=estilo, expand=True
        ),
        ft.ElevatedButton(
            "[1] ENCARGADO 1 — PÉREZ",
            on_click=lambda e: mostrar_dialogo(e, 1, "ventana_encargado1.html"),
            style=estilo, expand=True
        ),
        ft.ElevatedButton(
            "[2] ENCARGADO 2 — SÁNCHEZ",
            on_click=lambda e: mostrar_dialogo(e, 2, "ventana_encargado2.html"),
            style=estilo, expand=True
        ),
        ft.ElevatedButton(
            "[3] ENCARGADO 3",
            on_click=lambda e: mostrar_dialogo(e, 3, "ventana_encargado3.html"),
            style=estilo, expand=True
        ),
        ft.ElevatedButton(
            "[4] ENCARGADO 4 — MARÍA",
            on_click=lambda e: mostrar_dialogo(e, 4, "ventana_encargado4.html"),
            style=estilo, expand=True
        ),
        ft.ElevatedButton(
            "[5] ENCARGADO 5",
            on_click=lambda e: mostrar_dialogo(e, 5, "ventana_encargado5.html"),
            style=estilo, expand=True
        ),

        ft.Divider(color=ft.colors.TRANSPARENT, height=20),
        ft.Text(
            "ANAROBER © 2026 — DOLI AEROPARQUE",
            color=ft.colors.GREY_600,
            size=12,
            font_family="Courier New",
            text_align=ft.TextAlign.CENTER
        )
    )

if __name__ == "__main__":
    ft.run(main)