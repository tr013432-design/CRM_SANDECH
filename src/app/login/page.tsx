import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-sky-300">SANDECH CRM</p>
          <h1 className="text-4xl font-bold leading-tight">
            CRM técnico-comercial para propostas de engenharia.
          </h1>
          <p className="mt-5 text-base text-slate-300">
            Estruturado para contas, oportunidades, TR, RFQ, HH, proposta, negociação e rastreabilidade.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <h2 className="text-2xl font-semibold">Entrar</h2>
          <p className="mt-2 text-sm text-slate-500">Acesso interno da operação comercial SANDECH.</p>

          <form action={signIn} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">E-mail</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0"
                placeholder="voce@sandech.com.br"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Senha</label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0"
                placeholder="********"
              />
            </div>
            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800">
              Entrar
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
