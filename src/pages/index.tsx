import { useState } from 'react';
import { GetStaticProps } from 'next'
import Head from 'next/head';
import Link from 'next/link'

import { FiCalendar, FiUser } from 'react-icons/fi'

import PTBR from 'date-fns/locale/pt-BR'
import { format } from 'date-fns'

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function formatPosts (posts: PostPagination): Post[]{
  const formatedPost = posts.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
        locale: PTBR
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }

  })
  return formatedPost
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {

  // Formata a data dos posts //
  const postsDataFormated = postsPagination.results.map(post => (
    {
      ...post,
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM yyyy', {
        locale: PTBR
      }) ?? null
    }
  ))

  const [posts, setPosts] = useState<Post[]>(postsDataFormated)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  // Carrega mais posts ao clicar em Leia Mais //
  async function handleToReadMore(): Promise<void>{

    const response = await fetch(postsPagination.next_page)

    const responseJSON = await response.json()

    const newPosts = formatPosts(responseJSON)
    
    setPosts([...posts, ...newPosts])
    setNextPage(responseJSON.next_page)
  }

  return (
    <div className={commonStyles.container}>

      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      {
        posts.map(post => {
          return (
            <Link href={`post/${post.uid}`} key={post.uid}>
              <a className={styles.postItem}>
                <h3>{post.data.title}</h3>
                <p>{post.data.subtitle}</p>
                <footer>
                  <span>
                    <FiCalendar /> <time>{post.first_publication_date}</time>
                  </span>

                  <span>
                    <FiUser /> {post.data.author}
                  </span>
                </footer>
              </a>
            </Link>
          )
        })
      }

      {
        nextPage ? (
          <button 
            type='button'
            className={styles.readMoreButton}
            onClick={handleToReadMore}>
            Carregar mais posts
          </button>
        ) : ''
      }
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (req) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'publication'),
    {
      pageSize: 2,
      fetch: ['publication.title', 'publication.subtitle', 'publication.author'],
    });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      }
    },
    revalidate: 60 * 60 * 2 // 2 horas //
  }
};