import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { UserNav } from '@/components/UserNav';
import { Header } from '@/components/Header';
import { IconHistory, IconCheck, IconClock, IconX, IconInbox } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function MyRequestsPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('requests')
    .select('*, quest:quests(*)')
    .eq('user_id', profile.id)
    .order('submitted_at', { ascending: false });

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <Header title="My requests" subtitle="All your quest submissions" icon={<IconHistory size={22} />} color="green" />
        {(!requests || requests.length === 0) ? (
          <div className="text-center py-10 px-5 text-brand-muted font-bold text-sm leading-relaxed">
            <IconInbox size={40} className="text-[#c8e6c9] mx-auto mb-2.5" />
            No requests yet.<br />Prove your first quest!
          </div>
        ) : (
          <div className="p-3.5 flex flex-col gap-2.5">
            {requests.map((r: any) => {
              const status = r.status as 'approved' | 'pending' | 'rejected';
              return (
                <div key={r.id} className="bg-white rounded-[13px] p-3 border-[1.5px] border-brand-beige">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-[10px] bg-[#e8f5e8] text-brand-green flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {r.quest?.image_url ? (
                        <img src={r.quest.image_url} alt={r.quest.title} className="w-full h-full object-cover" />
                      ) : (
                        <i className={`ti ${r.quest?.icon || 'ti-paw'}`} style={{ fontSize: 20 }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-extrabold text-[#1a1a1a]">{r.quest?.title}</div>
                      <div className="text-[10px] text-brand-muted font-bold mt-px">
                        {new Date(r.submitted_at).toLocaleDateString()} • +{r.quest?.points} pts
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <UserNav />
    </>
  );
}

function StatusBadge({ status }: { status: 'approved' | 'pending' | 'rejected' }) {
  if (status === 'approved') return <div className="bg-[#e8f5e8] text-brand-green text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5"><IconCheck size={11} />Approved</div>;
  if (status === 'pending') return <div className="bg-[#fff3e0] text-[#a85e0c] text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5"><IconClock size={11} />Pending</div>;
  return <div className="bg-[#faebec] text-[#a83232] text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5"><IconX size={11} />Rejected</div>;
}
