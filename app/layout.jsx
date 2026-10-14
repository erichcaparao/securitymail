export const metadata = {
  title: 'Engelmig',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
