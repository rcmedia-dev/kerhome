import prisma from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany();

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Usuários</h1>

      {users.length === 0 ? (
        <p className="text-gray-500">Nenhum usuário encontrado.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold text-purple-700 mb-1">
                {user.primeiro_nome} {user.ultimo_nome}
              </h2>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Email:</strong> {user.username}</li>
                <li><strong>Telefone:</strong> {user.telefone}</li>
                <li><strong>Empresa:</strong> {user.empresa}</li>
                <li><strong>Licença:</strong> {user.licenca}</li>
                <li><strong>Website:</strong> {user.website}</li>
                <li><strong>Facebook:</strong> {user.facebook}</li>
                <li><strong>LinkedIn:</strong> {user.linkedin}</li>
                <li><strong>Instagram:</strong> {user.instagram}</li>
                <li><strong>YouTube:</strong> {user.youtube}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
