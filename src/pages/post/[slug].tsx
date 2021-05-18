import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { format } from 'date-fns';
import PTBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {

  const { isFallback } = useRouter()

  if (isFallback) {
    return (
      <h1 className={commonStyles.loadingScreen}>Carregando...</h1>
    )
  }

  const dateFormatted = format(new Date(post.first_publication_date), 'dd MMM yyyy', {
    locale: PTBR
  })

  const timeOfReading = post.data.content.reduce((acc, content) => {
    const body = RichText.asText(content.body)
    const wordsArray = body.split(' ')
    const wtdWords = wordsArray.length
  
    const result = Math.ceil(wtdWords / 200)
    
    acc += result;

    return acc;
  }, 0)

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>

      <img src={post.data.banner.url} alt={post.data.title} className={styles.banner} />

      <main className={`${commonStyles.container} ${styles.contentContainer}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.legends}>
          <span>
            <FiCalendar />
            {dateFormatted}
          </span>

          <span>
            <FiUser />
            {post.data.author}
          </span>

          <span>
            <FiClock />
            {`${timeOfReading} min`}
          </span>
        </div>

        <article className={styles.content}>
          {
            post.data.content.map(content => (
              <div key={content.heading} className={styles.paragraph}>
                <h2>{content.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
              </div>
            ))
          }
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ]);

  const paths = response.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const { slug } = params

  const prismic = getPrismicClient();
  const posts = await prismic.getByUID('publication', String(slug), {});

  const post = {
    uid: posts.uid,
    first_publication_date: posts.first_publication_date,
    data: {
      title: posts.data.title,
      subtitle: posts.data.subtitle,
      banner: {
        url: posts.data.banner.url
      },
      author: posts.data.author,
      content: posts.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        }
      })
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 60 // 1 hora //
  }

};
