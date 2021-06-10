import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header';

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import ptBR from 'date-fns/locale/pt-BR';

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

export default function Post({post}: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }
  
  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <section className={styles.main}>
        <div className={styles.title}>
          {post.data.title}
        </div>
        <div className={styles.info}>
                <img src="/calendar.svg" alt="calendario" />
                <time>{format(parseISO(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR }) }</time>
                <img src="/user.svg" alt="usuario" />
                <div>{post.data.author}</div>
                <img src="/clock.svg" alt="clock" />
                <div>4 min</div>
        </div>
        <strong>{post.data.content[0].heading}</strong>          
          <p>
            {post.data.content[0].body[0].text}
          </p>
      </section>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.uid']    
  });

  return {
    paths: posts.results.map(post => {
      return {
        params: {
       slug: post.uid 
      }
    }
    }),
    fallback: true
  }

};

export const getStaticProps: GetStaticProps = async context => {
  const {slug} = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  // const readPost = {
  //   uid: response.uid,
  //   first_publication_date: response.first_publication_date,
  //   data: {
  //     title: response.data.title,
  //     banner: {
  //       url: response.data.banner.url
  //     },
  //     author: response.data.author,
  //     content: response.data.content.map(
  //       content => {
  //         return {
  //           heading: content.heading,
  //           body: [...content.body]
  //         }
  //       }
  //     )
  //   }
  // }

  return {
    props: {
      post: response
    },
    revalidate: 60 * 2 //2 min
  }
};
