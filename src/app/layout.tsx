import './globals.css';

export const metadata = {
  title: 'starTodo — pequenos passos, grandes constelações',
  description: 'Organize o que importa com o starTodo.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}