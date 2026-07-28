import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ArticleMarkdown({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: SafeLink,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}

function SafeLink({ href, children, ...props }: ComponentPropsWithoutRef<"a">) {
  const external = href?.startsWith("http://") || href?.startsWith("https://");
  return (
    <a
      {...props}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {children}
    </a>
  );
}
