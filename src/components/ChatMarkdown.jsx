import ReactMarkdown from "react-markdown";

const markdownComponents = {
  h3: ({ children }) => <h3 className="askSamirMdHeading">{children}</h3>,
  h4: ({ children }) => <h4 className="askSamirMdSubheading">{children}</h4>,
  p: ({ children }) => <p className="askSamirMdParagraph">{children}</p>,
  strong: ({ children }) => <strong className="askSamirMdStrong">{children}</strong>,
  em: ({ children }) => <em className="askSamirMdEm">{children}</em>,
  ul: ({ children }) => <ul className="askSamirMdList">{children}</ul>,
  ol: ({ children }) => <ol className="askSamirMdList is-ordered">{children}</ol>,
  li: ({ children }) => <li className="askSamirMdListItem">{children}</li>,
};

export default function ChatMarkdown({ content }) {
  if (!content) return null;

  return (
    <div className="askSamirMarkdown">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
