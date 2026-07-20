import * as React from "react";
import { cn } from "@/lib/utils";

function Table({
  className,
  containerClassName,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & { containerClassName?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-border", containerClassName)}>
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-surface-muted [&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b border-border transition-colors hover:bg-surface-muted/60", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 whitespace-nowrap px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("whitespace-nowrap px-3 py-2 align-middle", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn("mt-2 text-sm text-muted-foreground", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
