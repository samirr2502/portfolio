import { useEffect, useRef } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

function DeploymentsSection({ deployments }) {
  const listRef = useRef(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return undefined;

    const rows = root.querySelectorAll(".deployRow");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    rows.forEach((row, i) => {
      row.style.setProperty("--stagger", `${i * 60}ms`);
      observer.observe(row);
    });

    return () => observer.disconnect();
  }, [deployments]);

  return (
    <section className="deploymentsSection" id="deployments">
      <div className="sectionHeaderLab">
        <h2>Live deployments</h2>
        <p>Production and staging surfaces running on my EC2 / Nginx stack.</p>
      </div>

      <div className="deployList" ref={listRef}>
        {deployments.map((item) => (
          <a
            key={item.id}
            className="deployRow"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="deployMain">
              <span className="deployOrg">{item.org}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <div className="deployMeta">
              <span className={`statusBadge status-${item.status}`}>
                <span className="dot" />
                {item.status === "healthy" ? "Healthy" : "Issue"}
              </span>
              <span className="envChip">{item.env}</span>
              <span className="deployUrl">
                {item.url.replace(/^https?:\/\//, "")}
                <FaExternalLinkAlt size={11} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default DeploymentsSection;
