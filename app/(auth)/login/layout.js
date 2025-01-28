import "../../styles/globals.css";
import StoreProvider from "../../StoreProvider";

export const metadata = {
  title: "Resource Allocations", 
  description: "Resource Allocations",
};

export default function LoginLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children} 
        </StoreProvider>
      </body>
    </html>
  );
}
