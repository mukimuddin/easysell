import Link from 'next/link';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home(props) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  let channels = [];
  let totalPages = 1;

  try {
    // Get total count for pagination
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM channels WHERE status IN ("approved", "sold")');
    const totalItems = countRows[0].total;
    totalPages = Math.ceil(totalItems / limit);

    // Get channels with limit and offset
    const [rows] = await pool.query(
      'SELECT * FROM channels WHERE status IN ("approved", "sold") ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    channels = rows;
  } catch (error) {
    console.error('Failed to fetch channels:', error.message);
  }

  return (
    <main>
      <section className="hero">
        <h1>YouTube Marketplace</h1>
        <p>Buy & sell quality YouTube channels securely with zero hassle.</p>
      </section>

      <section className="common-container">
        <h2 className="section-title">Latest Opportunities</h2>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Channel Link</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td colSpan="3" className="center-text" style={{ padding: '4rem 1rem', color: 'var(--muted-foreground)' }}>No channels available yet. Check back soon!</td>
                </tr>
              ) : (
                channels.map((channel) => (
                  <tr key={channel.id}>
                    <td data-label="Owner" style={{ fontWeight: 600 }}>{channel.channel_name}</td>
                    <td data-label="Channel">
                      <a href={channel.channel_link} target="_blank" rel="noopener noreferrer" className="channel-link" style={{ fontSize: '0.875rem', color: 'var(--info)' }}>
                        Visit Channel
                      </a>
                    </td>
                    <td data-label="Action" style={{ textAlign: 'right' }}>
                      <a href={`https://wa.me/${channel.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Contact</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <Link 
              href={`/?page=${page - 1}`} 
              className={`page-btn ${page === 1 ? 'disabled' : ''}`}
              aria-disabled={page === 1}
              style={page === 1 ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              &laquo;
            </Link>
            
            {[...Array(totalPages)].map((_, i) => (
              <Link 
                key={i + 1}
                href={`/?page=${i + 1}`} 
                className={`page-btn ${page === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </Link>
            ))}

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
      </section>
    </main>
  );
}

