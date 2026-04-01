import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default PublicLayout;