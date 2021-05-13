import { GetStaticProps } from 'next'
import { ReactElement } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi'

import PTBR from 'date-fns/locale/pt-BR'
import { format, parseISO } from 'date-fns'

import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
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

export default function Home({ postsPagination }: HomeProps): ReactElement {
  return (
    <div className={commonStyles.container}>
      <ul className={styles.postsList}>
        {
          postsPagination.results.map(post => {
            return (
              <li key={post.uid}>
                <h3>{post.data.title}</h3>
                <p>{post.data.subtitle}</p>
                <span>
                  <FiCalendar /> {post.first_publication_date}
                  <FiUser /> {post.data.author}
                </span>
              </li>
            )
          })
        }
      </ul>

      <button type='button' className={styles.readMoreButton}>
        Carregar mais posts
      </button>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (req) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 10
    });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(parseISO(post.first_publication_date), 'dd MMM Y', {
        locale: PTBR
      }) ?? null,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: RichText.asText(post.data.author)
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results
  }

  return {
    props: {
      postsPagination
    }
  }
};
