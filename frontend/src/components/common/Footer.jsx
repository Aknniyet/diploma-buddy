import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">

        <div className="footer-column">
          <h3>KazakhBuddy</h3>
          <p>
            Connecting international students with local buddies to make
            their transition to university life easier.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <a href="/about">About</a>
          <a href="/guide">Adaptation Guide</a>
          <a href="/signup">Join as Student</a>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <p>support@kazakhbuddy.kz</p>
          <p>Astana, Kazakhstan</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 KazakhBuddy. Made for international students.
      </div>
    </footer>
  );
}

export default Footer;