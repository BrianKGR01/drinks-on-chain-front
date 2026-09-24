import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center gap-8 px-6">
      <p className="small-heading">404</p>
      <h1 className="text-heading">Parcela no encontrada</h1>
      <Link href="/" className="underline-anim font-display tracking-wide-ui uppercase text-sm">
        Volver al mapa
      </Link>
    </main>
  );
}
