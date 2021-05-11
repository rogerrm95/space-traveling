import { GetStaticProps } from 'next'
import { ReactElement } from 'react';
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

export default function Home(): ReactElement {
  return (
    <div>
      <h1>Ola Mundo ....</h1>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async (req) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(Prismic.Predicates.at('document.type', 'posts'));


  return {
    props: {
      data: []
    }
  }
};
