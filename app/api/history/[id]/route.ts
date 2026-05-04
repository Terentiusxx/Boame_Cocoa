import { proxyBackendJson } from '@/lib/backendProxy';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyBackendJson(`/history/delete/${id}`, { method: 'DELETE' });
}
