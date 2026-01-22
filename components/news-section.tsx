"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  color: string;
  featured: boolean;
  order: number;
  icon?: string; // Added optional icon field
}

export function NewsSection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await client.fetch(
        `*[_type == "category" && featured == true] | order(order asc) {
          _id,
          title,
          "slug":slug.current,
          description,
          "id": _id,
          color,
          featured,
          order,
          icon // Fetching optional icon field
        }`
      );
      setCategories(data);
    };

    fetchCategories();
  }, []);

  return (
    <section className="bg-card py-12">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-center mb-8">Featured Categories</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-col items-center text-center">
              <div
                className="p-4 rounded-full mb-4"
                style={{ backgroundColor: category.color }}
              >
                {category.icon && (
                  <img
                    src={category.icon}
                    alt={`${category.title} icon`}
                    className="w-12 h-12 object-contain"
                  />
                )}
              </div>
              <Link
                href={`/categories/${category.slug}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {category.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-2">
                {category.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}