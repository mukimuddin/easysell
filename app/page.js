import Link from 'next/link';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home(props) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page) || 1;
  const limit = 50; // Show more channels in a compact list
  const offset = (page - 1) * limit;

  let channels = [];
  let totalPages = 1;

  try {
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM channels WHERE is_selected = 1');
    const totalItems = countRows[0].total;
    totalPages = Math.ceil(totalItems / limit);

    const [rows] = await pool.query(
      `SELECT id, channel_name, channel_link FROM channels 
       WHERE is_selected = 1 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    channels = rows;
  } catch (error) {
    console.error('Failed to fetch channels:', error.message);
  }

  return (
    <main style={{ padding: '1rem 0' }}>
      <div className="minimal-list">
        {channels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
            No channels available today.
          </div>
        ) : (
          channels.map((channel, index) => (
            <a 
              key={channel.id} 
              href={channel.channel_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="minimal-item"
            >
              <div className="item-serial">
                {offset + index + 1}.
              </div>
              <div className="item-name">
                {channel.channel_name}
              </div>
            </a>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '1rem' }}>
          <Link 
            href={`/?page=${page - 1}`} 
            className={`page-btn ${page === 1 ? 'disabled' : ''}`}
            aria-disabled={page === 1}
            style={page === 1 ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            &laquo;
          </Link>
          
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
            Page {page} of {totalPages}
          </span>

          <Link 
            href={`/?page=${page + 1}`} 
            className={`page-btn ${page === totalPages ? 'disabled' : ''}`}
            aria-disabled={page === totalPages}
            style={page === totalPages ? { pointerEvents: 'none', opacity: 0.5 } : {}}
          >
            &raquo;
          </Link>
        </div>
      )}
      {/* Hidden Compact Admin Link */}
      <Link 
        href="/admin" 
        className="admin-secret-link"
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
          width: '10px',
          height: '10px',
          backgroundColor: '#6366f1',
          borderRadius: '2px',
          zIndex: 9999,
          cursor: 'pointer',
          textDecoration: 'none'
        }}
        title="Admin"
      />
    </main>
  );
}
