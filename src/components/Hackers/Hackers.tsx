import "./Hackers.css";

export function Hackers() {
  return (
    <div className="hackers">
      <h4 className="hackers__title">HACKER LIST</h4>
      <p>
        Put your github username at the top of the ranking with less than 3
        seconds and I'll put you on the hacker list
      </p>

      <ul>
        <li>
          <a
            href="https://github.com/thiago-buarqque"
            target="_blank"
            rel="noreferrer"
          >
            @thiago-buarqque
          </a>
        </li>
      </ul>
    </div>
  );
}
