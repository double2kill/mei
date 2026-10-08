type PageStatusProps = {
  loading?: boolean;
  error?: string | null;
};

export function PageStatus({ loading, error }: PageStatusProps) {
  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <div className="text-center">
          <p className="text-lg text-zinc-800 dark:text-zinc-200">服务不可用</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            请稍后再试，或联系管理员
          </p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500 dark:text-zinc-400">加载中…</p>
      </div>
    );
  }
  return null;
}
