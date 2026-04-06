import Link from 'next/link';
import pool from '@/lib/db';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

export const dynamic = 'force-dynamic';

export default async function Home(props) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page) || 1;
  const limit = 20; // Show more channels per page
  const offset = (page - 1) * limit;

  let channels = [];
  let totalPages = 1;

  try {
    // Get total count for pagination (only selected channels)
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM channels WHERE is_selected = 1');
    const totalItems = countRows[0].total;
    totalPages = Math.ceil(totalItems / limit);

    // Get selected channels with their latest status
    const [rows] = await pool.query(
      `SELECT c.*, u.status as growth_status, u.sub_count, u.shorts_count 
       FROM channels c 
       LEFT JOIN (
           SELECT * FROM daily_updates WHERE id IN (SELECT MAX(id) FROM daily_updates GROUP BY channel_id)
       ) u ON c.id = u.channel_id
       WHERE c.is_selected = 1 
       ORDER BY c.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    channels = rows;
  } catch (error) {
    console.error('Failed to fetch channels:', error.message);
  }

  return (
    <main>
      <section className="hero">
        <h1>YouTube Growth Center</h1>
        <p>Support these rising creators by subscribing. Help them reach their daily goals!</p>
      </section>

      <section className="common-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Active Channels</h2>
          <div className="status-badge status-approved" style={{ fontSize: '0.75rem' }}>Live Updates</div>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Channel Name</th>
                <th>Daily Growth</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td colSpan="3" className="center-text" style={{ padding: '4rem 1rem', color: 'var(--muted-foreground)' }}>
                    No channels featured today. Please check back later!
                  </td>
                </tr>
              ) : (
                channels.map((channel) => (
                  <tr key={channel.id}>
                    <td data-label="Channel">
                      <div style={{ fontWeight: 600 }}>{channel.channel_name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                        {channel.sub_count ? `${channel.sub_count.toLocaleString()} Subscribers` : 'Starting Phase'}
                        {channel.shorts_count > 0 && ` • ${channel.shorts_count} Shorts Today`}
                      </div>

                    </td>
                    <td data-label="Growth">
                      {channel.growth_status === 'growing' ? (
                        <span className="status-badge status-approved" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>🔥 Growing</span>
                      ) : channel.growth_status === 'flop' ? (
                        <span className="status-badge status-rejected" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>📉 Flop</span>
                      ) : (
                        <span className="status-badge" style={{ background: 'var(--muted)', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Pending Update</span>
                      )}
                    </td>
                    <td data-label="Action" style={{ textAlign: 'right' }}>
                      <a 
                        href={channel.channel_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-approve"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        Subscribe Now
                      </a>
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

      <div className="common-container" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Support Mission</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
          This platform is dedicated to promoting YouTube creators. By subscribing to the channels above, you are helping small creators achieve their dreams. 
          Make sure to click "Subscribe Now" and confirm your support on YouTube.
        </p>
      </div>
    </main>
  );
}
