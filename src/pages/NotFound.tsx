const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center stadium-bg">
      <div className="text-center space-y-4">
        <div className="text-5xl">🏏</div>
        <h1 className="text-4xl font-bold text-secondary">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <a
          href="/"
          className="inline-block px-5 py-2 rounded-xl text-sm font-display uppercase tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors"
        >
          Back to Game
        </a>
      </div>
    </div>
  );
};

export default NotFound;
