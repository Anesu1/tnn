import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ArticleCardProps {
    variant?: "standard" | "horizontal" | "compact"
    category: string
    title: string
    excerpt?: string
    image?: string
    author?: string
    date?: string
    className?: string
}

export function ArticleCard({
    variant = "standard",
    category,
    title,
    excerpt,
    image,
    author,
    date,
    className
}: ArticleCardProps) {

    if (variant === "compact") {
        return (
            <div className={cn("group cursor-pointer flex flex-col space-y-2", className)}>
                <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{category}</span>
                </div>
                <h3 className="text-base font-serif font-bold leading-snug group-hover:text-accent transition-colors">
                    {title}
                </h3>
                {date && <span className="text-xs text-muted-foreground">{date}</span>}
            </div>
        )
    }

    if (variant === "horizontal") {
        return (
            <div className={cn("group cursor-pointer grid grid-cols-12 gap-4 items-start", className)}>
                <div className="col-span-8 flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{category}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-serif font-bold leading-snug group-hover:underline decoration-1 underline-offset-4">
                        {title}
                    </h3>
                    {excerpt && <p className="text-sm text-muted-foreground line-clamp-2 hidden md:block">{excerpt}</p>}
                    <div className="flex items-center text-xs text-muted-foreground pt-1">
                        {author && <span className="mr-2 font-medium">{author}</span>}
                        {date && <span>{date}</span>}
                    </div>
                </div>
                <div className="col-span-4 relative aspect-[4/3] overflow-hidden">
                    {image && (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    )}
                </div>
            </div>
        )
    }

    // Standard vertical card
    return (
        <div className={cn("group cursor-pointer flex flex-col space-y-3", className)}>
            <div className="relative aspect-video w-full overflow-hidden">
                {image && (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}
            </div>
            <div className="flex flex-col space-y-2">
                <Badge variant="secondary" className="w-fit rounded-none text-[10px] uppercase tracking-wider font-bold">
                    {category}
                </Badge>
                <h3 className="text-xl font-serif font-bold leading-snug group-hover:text-accent transition-colors">
                    {title}
                </h3>
                {excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                    {author && <span>{author}</span>}
                    {date && <span>{date}</span>}
                </div>
            </div>
        </div>
    )
}
