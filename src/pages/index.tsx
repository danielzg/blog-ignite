import { GetStaticProps } from 'next';
import Link from 'next/link'
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';

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

export default function Home({postsPagination}: HomeProps) {
  return (
    <>
      <header className={styles.header}>
        <img src="/logo.svg" alt="logo" />
      </header>
      <main className={styles.container}>
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link href="#">
            <a key={post.uid}>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div className={styles.info}>
                <img src="/calendar.svg" alt="calendario" />
                <time>{post.first_publication_date}</time>
                <img src="user.svg" alt="usuario" />
                <div>{post.data.author}</div>
              </div>
            </a>
          </Link>
          ))}
          
        </div>

        <button>Carregar mais posts</button>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
      Prismic.predicates.at('document.type', 'post')
  ],{
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 5
  })

  console.log(JSON.stringify(postsResponse, null, 2))

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(parseISO(post.last_publication_date), 'd MMM yy', { locale: ptBR }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
      // banner: post.data.banner,
      // contentHeading: post.data.content.find(content => content.type == 'heading')?.text ?? '',
      // contentBody: post.data.content.find(content => content.type == 'body')?.text ?? '',
    }
  })

  const postsPagination: PostPagination = {
    next_page: 'trd',
    results: posts
  }

  return {
    props : {
      postsPagination
    }
    
  }
};
