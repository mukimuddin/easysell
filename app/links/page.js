import Link from 'next/link';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LinksPage(props) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  let links = [];
  let totalPages = 1;

  try {
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM channels WHERE status IN ("approved", "sold")');
    const totalItems = countRows[0].total;
    totalPages = Math.ceil(totalItems / limit);

    const [rows] = await pool.query(
      'SELECT channel_link FROM channels WHERE status IN ("approved", "sold") ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    links = rows;
  } catch (error) {
    console.error('Failed to fetch links:', error.message);
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Channel Links Directory</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {links.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)' }}>No links available.</p>
        ) : (
          links.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <a 
                href={item.channel_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="channel-link"
                style={{ fontSize: '0.9rem', color: 'var(--info)' }}
              >
                Visit Channel
              </a>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Link 
            href={`/links?page=${page - 1}`} 
            className={`page-btn ${page === 1 ? 'disabled' : ''}`}
            aria-disabled={page === 1}
            style={page === 1 ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            &laquo;
          </Link>
          
          {[...Array(totalPages)].map((_, i) => (
            <Link 
              key={i + 1}
              href={`/links?page=${i + 1}`} 
              className={`page-btn ${page === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </Link>
          ))}

          <Link 
            href={`/links?page=${page + 1}`} 
            className={`page-btn ${page === totalPages ? 'disabled' : ''}`}
            aria-disabled={page === totalPages}
            style={page === totalPages ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            &raquo;
          </Link>
        </div>
      )}
    </main>
  );
}

