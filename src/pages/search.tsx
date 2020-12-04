import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from 'next/link';
import { FormEvent, useState } from "react"
import Prismic from 'prismic-javascript';
import PrismicDom from 'prismic-dom';
import { Document } from 'prismic-javascript/types/documents';
import { client } from "@/lib/prismic";

interface Searchprops {
  searchResults: Document[];
}

export default function Search({ searchResults }: Searchprops) {
  const router = useRouter();

  const [search, setSearch] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();

    router.push(`/search?q=${encodeURIComponent(search)}`);

    setSearch('');
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}  />
      </form>
      <button type="submit">Search</button>

      <ul>
          {searchResults.map(product => {
            return (
              <li key={product.id} >
                <Link href={`/catalog/products/${product.uid}`} >
                  <a>
                    {PrismicDom.RichText.asText(product.data.title)}
                  </a>
                </Link>
              </li>
            )
          })}
        </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Searchprops> = async (context) => {
  const { q } = context.query;

  if (!q) {
    return { props: { searchResults: [] } };
  }

  const searchResults = await client().query([
    Prismic.Predicates.at('document.type', 'product'),
    Prismic.Predicates.fulltext('my.product.title', String(q))
  ])

  return { 
    props: { 
      searchResults: searchResults.results 
    } 
  }
}