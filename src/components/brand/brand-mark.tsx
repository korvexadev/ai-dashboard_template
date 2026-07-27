import Image from "next/image";

export function BrandMark() {
  return (
    <span className="brand-logo" aria-hidden="true">
      <Image src="/images/logo.png" alt="" fill sizes="40px" priority />
    </span>
  );
}
