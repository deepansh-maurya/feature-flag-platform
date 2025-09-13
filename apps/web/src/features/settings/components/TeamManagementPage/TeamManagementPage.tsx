// "use client";

// import React, { useMemo, useState } from "react";
// import styles from "./TeamManagementPage.module.css";

// // -----------------------------
// // Types
// // -----------------------------
// type RoleKey = "owner" | "admin" | "developer" | "ops" | "viewer" | string;
// type Permission =
//   | "read"
//   | "write"
//   | "approve"
//   | "manage_members"
//   | "manage_keys"
//   | "billing";

// type Role = {
//   id: string;
//   key: RoleKey;
//   name: string;
//   description?: string;
//   permissions: Permission[];
//   system?: boolean; // true: cannot delete
// };

// type Member = {
//   id: string;
//   name: string;
//   email: string;
//   roleKey: RoleKey;
//   joinedAt: string;
//   status: "active" | "invited";
// };

// // -----------------------------
// // Mock Data
// // -----------------------------
// const initialRoles: Role[] = [
//   {
//     id: "r_owner",
//     key: "owner",
//     name: "Owner",
//     description: "Full access including billing and org deletion.",
//     permissions: ["read", "write", "approve", "manage_members", "manage_keys", "billing"],
//     system: true
//   },
//   {
//     id: "r_admin",
//     key: "admin",
//     name: "Admin",
//     description: "Manage members, projects, flags, keys.",
//     permissions: ["read", "write", "approve", "manage_members", "manage_keys"],
//     system: true
//   },
//   {
//     id: "r_dev",
//     key: "developer",
//     name: "Developer",
//     description: "Create/edit flags. Prod requires approval.",
//     permissions: ["read", "write"],
//     system: true
//   },
//   {
//     id: "r_ops",
//     key: "ops",
//     name: "Ops",
//     description: "Operate in prod, rotate server keys, approve changes.",
//     permissions: ["read", "write", "approve", "manage_keys"],
//     system: true
//   },
//   {
//     id: "r_view",
//     key: "viewer",
//     name: "Viewer",
//     description: "Read-only access to flags, analytics, audit.",
//     permissions: ["read"],
//     system: true
//   }
// ];

// const initialMembers: Member[] = [
//   { id: "m1", name: "Deepansh Maurya", email: "deepansh@example.com", roleKey: "owner", joinedAt: "2024-06-01", status: "active" },
//   { id: "m2", name: "Asha Singh", email: "asha@example.com", roleKey: "developer", joinedAt: "2024-07-12", status: "active" },
//   { id: "m3", name: "Ravi Kumar", email: "ravi@example.com", roleKey: "ops", joinedAt: "2024-08-01", status: "invited" }
// ];

// // canonical permission list for role editor
// const ALL_PERMS: { key: Permission; label: string; hint?: string }[] = [
//   { key: "read", label: "Read", hint: "View flags, analytics, audit" },
//   { key: "write", label: "Write", hint: "Create/edit flags, rules, rollouts" },
//   { key: "approve", label: "Approve", hint: "Approve change requests (prod)" },
//   { key: "manage_members", label: "Manage members", hint: "Invite/remove members, change roles" },
//   { key: "manage_keys", label: "Manage keys", hint: "Rotate/revoke SDK keys" },
//   { key: "billing", label: "Billing", hint: "Billing, plans, invoices" }
// ];

// // -----------------------------
// // Page
// // -----------------------------
// export default function TeamManagementPage() {
//   const [roles, setRoles] = useState<Role[]>(initialRoles);
//   const [members, setMembers] = useState<Member[]>(initialMembers);

//   const [search, setSearch] = useState("");
//   const [roleModal, setRoleModal] = useState<{ open: boolean; editing?: Role | null }>({ open: false });
//   const [memberModal, setMemberModal] = useState<{ open: boolean; editing?: Member | null }>({ open: false });
//   const [confirm, setConfirm] = useState<{ open: boolean; label: string; onYes: () => void } | null>(null);
//   const [toast, setToast] = useState<string>("");

//   const roleByKey = useMemo(() => Object.fromEntries(roles.map(r => [r.key, r])), [roles]);

//   const filteredMembers = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return members;
//     return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
//   }, [members, search]);

//   // --- helpers ---
//   function showToast(t: string) {
//     setToast(t);
//     setTimeout(() => setToast(""), 1500);
//   }

//   function upsertRole(data: Omit<Role, "id"> & { id?: string }) {
//     if (data.id) {
//       setRoles(prev => prev.map(r => (r.id === data.id ? { ...r, ...data } as Role : r)));
//       showToast("Role updated");
//     } else {
//       const id = `r_${Date.now()}`;
//       setRoles(prev => [...prev, { ...data, id } as Role]);
//       showToast("Role created");
//     }
//   }

//   function deleteRole(id: string) {
//     const target = roles.find(r => r.id === id);
//     if (!target) return;
//     if (target.system) {
//       showToast("System role cannot be deleted");
//       return;
//     }
//     // Reassign members using that role to viewer
//     setMembers(prev => prev.map(m => (m.roleKey === target.key ? { ...m, roleKey: "viewer" } : m)));
//     setRoles(prev => prev.filter(r => r.id !== id));
//     showToast("Role deleted; affected members set to Viewer");
//   }

//   function upsertMember(data: Omit<Member, "id" | "joinedAt"> & { id?: string; joinedAt?: string }) {
//     if (data.id) {
//       setMembers(prev => prev.map(m => (m.id === data.id ? { ...m, ...data } as Member : m)));
//       showToast("Member updated");
//     } else {
//       const id = `m_${Date.now()}`;
//       const joinedAt = new Date().toISOString().slice(0, 10);
//       setMembers(prev => [...prev, { ...data, id, joinedAt } as Member]);
//       showToast(data.status === "invited" ? "Invite sent" : "Member added");
//     }
//   }

//   function deleteMember(id: string) {
//     setMembers(prev => prev.filter(m => m.id !== id));
//     showToast("Member removed");
//   }

//   return (
//     <div className={styles.wrapper}>
//       {/* Header */}
//       <div className={styles.headerRow}>
//         <div className={styles.titleGroup}>
//           <div className={styles.headerTitle}>Team Management</div>
//           <div className={styles.subTitle}>Manage roles, permissions, and members</div>
//         </div>
//         <div className={styles.headerActions}>
//           <button className={styles.primaryBtn} onClick={() => setMemberModal({ open: true })}>Invite member</button>
//           <button className={styles.secondaryBtn} onClick={() => setRoleModal({ open: true })}>Create role</button>
//         </div>
//       </div>

//       {toast && <div className={styles.toast}>{toast}</div>}

//       {/* Roles + Permissions */}
//       <div className={styles.section}>
//         <div className={styles.sectionHeader}>
//           <div className={styles.sectionTitle}>Roles & Permissions</div>
//         </div>

//         <div className={styles.rolesGrid}>
//           {roles.map((r) => (
//             <div key={r.id} className={styles.roleCard}>
//               <div className={styles.roleHeader}>
//                 <div className={styles.roleName}>
//                   {r.name} {r.system && <span className={styles.sysBadge}>system</span>}
//                 </div>
//                 <div className={styles.roleKey}>{r.key}</div>
//               </div>
//               {r.description && <div className={styles.roleDesc}>{r.description}</div>}

//               <div className={styles.permList}>
//                 {ALL_PERMS.map(p => (
//                   <span
//                     key={p.key}
//                     className={
//                       r.permissions.includes(p.key)
//                         ? styles.permChipOn
//                         : styles.permChipOff
//                     }
//                     title={p.hint || ""}
//                   >
//                     {p.label}
//                   </span>
//                 ))}
//               </div>

//               <div className={styles.roleActions}>
//                 <button className={styles.smallBtn} onClick={() => setRoleModal({ open: true, editing: r })}>Edit</button>
//                 {!r.system && (
//                   <button
//                     className={styles.smallDanger}
//                     onClick={() =>
//                       setConfirm({
//                         open: true,
//                         label: `Delete role “${r.name}”? Members using it will become Viewers.`,
//                         onYes: () => {
//                           deleteRole(r.id);
//                           setConfirm(null);
//                         }
//                       })
//                     }
//                   >
//                     Delete
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Members */}
//       <div className={styles.section}>
//         <div className={styles.sectionHeader}>
//           <div className={styles.sectionTitle}>Members</div>
//           <div className={styles.memberControls}>
//             <input
//               className={styles.search}
//               placeholder="Search by name or email…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className={styles.membersList}>
//           {filteredMembers.map((m) => (
//             <div key={m.id} className={styles.memberRow}>
//               <div className={styles.memberInfo}>
//                 <div className={styles.memberName}>{m.name}</div>
//                 <div className={styles.memberEmail}>{m.email}</div>
//               </div>

//               <div className={styles.memberMeta}>
//                 <div className={styles.roleBadge}>{roleByKey[m.roleKey]?.name || m.roleKey}</div>
//                 <div className={m.status === "active" ? styles.statusActive : styles.statusInvited}>
//                   {m.status}
//                 </div>
//                 <div className={styles.dim}>joined {m.joinedAt}</div>
//               </div>

//               <div className={styles.memberActions}>
//                 <button className={styles.smallBtn} onClick={() => setMemberModal({ open: true, editing: m })}>Edit</button>
//                 <button
//                   className={styles.smallDanger}
//                   onClick={() =>
//                     setConfirm({
//                       open: true,
//                       label: `Remove ${m.name}?`,
//                       onYes: () => {
//                         deleteMember(m.id);
//                         setConfirm(null);
//                       }
//                     })
//                   }
//                 >
//                   Remove
//                 </button>
//               </div>
//             </div>
//           ))}

//           {filteredMembers.length === 0 && (
//             <div className={styles.empty}>No members found.</div>
//           )}
//         </div>
//       </div>

//       {/* Role Modal */}
//       {roleModal.open && (
//         <RoleEditor
//           initial={roleModal.editing}
//           onClose={() => setRoleModal({ open: false })}
//           onSave={(payload) => {
//             upsertRole(payload);
//             setRoleModal({ open: false });
//           }}
//         />
//       )}

//       {/* Member Modal */}
//       {memberModal.open && (
//         <MemberEditor
//           roles={roles}
//           initial={memberModal.editing}
//           onClose={() => setMemberModal({ open: false })}
//           onSave={(payload) => {
//             upsertMember(payload);
//             setMemberModal({ open: false });
//           }}
//         />
//       )}

//       {/* Confirm */}
//       {confirm?.open && (
//         <Confirm
//           label={confirm.label}
//           onCancel={() => setConfirm(null)}
//           onYes={confirm.onYes}
//         />
//       )}
//     </div>
//   );
// }

// // -----------------------------
// // Role Editor Modal
// // -----------------------------
// function RoleEditor({
//   initial,
//   onClose,
//   onSave
// }: {
//   initial?: Role | null;
//   onClose: () => void;
//   onSave: (payload: Omit<Role, "id"> & { id?: string }) => void;
// }) {
//   const [name, setName] = useState(initial?.name ?? "");
//   const [key, setKey] = useState(initial?.key ?? "");
//   const [desc, setDesc] = useState(initial?.description ?? "");
//   const [perms, setPerms] = useState<Permission[]>(initial?.permissions ?? ["read"]);

//   const isEditing = Boolean(initial?.id);

//   function togglePerm(p: Permission) {
//     setPerms(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
//   }

//   function handleSave() {
//     const payload = {
//       id: initial?.id,
//       key: key.trim() || name.trim().toLowerCase().replace(/\s+/g, "_"),
//       name: name.trim() || "Untitled",
//       description: desc.trim(),
//       permissions: perms
//     };
//     onSave(payload);
//   }

//   return (
//     <div className={styles.backdrop}>
//       <div className={styles.modal}>
//         <div className={styles.modalHeader}>
//           <div className={styles.modalTitle}>{isEditing ? "Edit role" : "Create role"}</div>
//           <button className={styles.closeBtn} onClick={onClose}>✕</button>
//         </div>

//         <div className={styles.formCol}>
//           <label className={styles.label}>Name</label>
//           <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Support Engineer" />

//           <label className={styles.label}>Key</label>
//           <input className={styles.input} value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. support_engineer" />

//           <label className={styles.label}>Description</label>
//           <textarea className={styles.textarea} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional" />

//           <label className={styles.label}>Permissions</label>
//           <div className={styles.permGrid}>
//             {ALL_PERMS.map(p => (
//               <label key={p.key} className={styles.cbRow} title={p.hint || ""}>
//                 <input
//                   type="checkbox"
//                   checked={perms.includes(p.key)}
//                   onChange={() => togglePerm(p.key)}
//                 />
//                 <span>{p.label}</span>
//                 {p.hint && <span className={styles.dim}>— {p.hint}</span>}
//               </label>
//             ))}
//           </div>
//         </div>

//         <div className={styles.modalActions}>
//           <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
//           <button className={styles.primaryBtn} onClick={handleSave}>{isEditing ? "Save" : "Create"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // -----------------------------
// // Member Editor Modal
// // -----------------------------
// function MemberEditor({
//   roles,
//   initial,
//   onClose,
//   onSave
// }: {
//   roles: Role[];
//   initial?: Member | null;
//   onClose: () => void;
//   onSave: (payload: Omit<Member, "id" | "joinedAt"> & { id?: string }) => void;
// }) {
//   const isEditing = Boolean(initial?.id);
//   const [name, setName] = useState(initial?.name ?? "");
//   const [email, setEmail] = useState(initial?.email ?? "");
//   const [roleKey, setRoleKey] = useState<RoleKey>(initial?.roleKey ?? "viewer");
//   const [status, setStatus] = useState<Member["status"]>(initial?.status ?? "invited");

//   function handleSave() {
//     onSave({
//       id: initial?.id,
//       name: name.trim() || email.split("@")[0],
//       email: email.trim(),
//       roleKey,
//       status
//     });
//   }

//   return (
//     <div className={styles.backdrop}>
//       <div className={styles.modal}>
//         <div className={styles.modalHeader}>
//           <div className={styles.modalTitle}>{isEditing ? "Edit member" : "Invite member"}</div>
//           <button className={styles.closeBtn} onClick={onClose}>✕</button>
//         </div>

//         <div className={styles.formCol}>
//           <label className={styles.label}>Name</label>
//           <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />

//           <label className={styles.label}>Email</label>
//           <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />

//           <label className={styles.label}>Role</label>
//           <select className={styles.select} value={roleKey} onChange={(e) => setRoleKey(e.target.value)}>
//             {roles.map(r => (
//               <option key={r.key} value={r.key}>{r.name}</option>
//             ))}
//           </select>

//           <label className={styles.label}>Status</label>
//           <div className={styles.inline}>
//             <label className={styles.radioRow}><input type="radio" checked={status==="invited"} onChange={()=>setStatus("invited")} />Invited</label>
//             <label className={styles.radioRow}><input type="radio" checked={status==="active"} onChange={()=>setStatus("active")} />Active</label>
//           </div>
//         </div>

//         <div className={styles.modalActions}>
//           <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
//           <button className={styles.primaryBtn} onClick={handleSave}>{isEditing ? "Save" : "Send invite"}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // -----------------------------
// // Confirm Modal
// // -----------------------------
// function Confirm({
//   label,
//   onCancel,
//   onYes
// }: {
//   label: string;
//   onCancel: () => void;
//   onYes: () => void;
// }) {
//   return (
//     <div className={styles.backdrop}>
//       <div className={styles.modalSmall}>
//         <div className={styles.modalTitle}>{label}</div>
//         <div className={styles.modalActions}>
//           <button className={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
//           <button className={styles.dangerBtn} onClick={onYes}>Yes</button>
//         </div>
//       </div>
//     </div>
//   );
// }
