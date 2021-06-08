import { GetStaticProps } from 'next';
import Link from 'next/link'
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';

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

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [newPage, setNewPage] = useState('')

  const firstPage = postsPagination.next_page;

  useEffect( () => {

    if(newPage){
      getMorePosts(newPage);
    }

  }, [newPage])

  async function getMorePosts(pageCharge) {
    let clonePosts = posts.slice()
    const newPosts = await fetch(pageCharge)
                                .then(response => response.json())
    
    const postsOrganized = newPosts.results.map( (newPost) => {

      return {
        uid: newPost.uid,
        first_publication_date: format(parseISO(newPost.last_publication_date), 'd MMM yy', { locale: ptBR }),
        data: {
          title: newPost.data.title,
          subtitle: newPost.data.subtitle,
          author: newPost.data.author
        }
      }
    } )
    
    clonePosts.push(...postsOrganized)
    setPosts(clonePosts)
  }
  
  async function handleCarregaPosts (next_page) {

    if(next_page == ''){
      setNewPage(firstPage)
      return;
    }
    
    const newPosts = await fetch(next_page)
                                .then(response => response.json())
    setNewPage(newPosts.next_page)
                                   
  }

  return (
    <>
      <header className={styles.header}>
        <img src="/logo.svg" alt="logo" />
      </header>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
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

        <button
        onClick={() => {
          handleCarregaPosts(newPage)}
        }
        >Carregar mais posts</button>
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
    pageSize: 2
  })

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
    next_page: postsResponse.next_page,
    results: posts
  }

  return {
    props : {
      postsPagination
    }
    
  }
};