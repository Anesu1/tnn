import { NewsCard } from "../ui/news-card";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  readTime: string;
  imageUrl: string;
  slug: string;
  variant?: "default" | "month" | "year-review";
  overlayPosition?: "left" | "right";
}

interface NewsGridProps {
  items: NewsItem[];
}

export function NewsGrid({ items }: NewsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
      {items.map((item) => (
        <NewsCard
          key={item.id}
          title={item.title}
          date={item.date}
          readTime={item.readTime}
          imageUrl={item.imageUrl}
          slug={item.slug}
          variant={item.variant}
          overlayPosition={item.overlayPosition}
        />
      ))}
    </div>
  );
}
