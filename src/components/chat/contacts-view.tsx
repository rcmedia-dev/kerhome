'use client';

import React, { Suspense } from 'react';
import { useChatStore } from '@/hooks/useChatStore';
import { useContacts } from '@/hooks/useChatQueries';
import { Users, ChevronRight } from 'lucide-react';
import styles from './contacts-view.module.css';

function ContactsContent() {
  const {
    userId,
    contactsPage,
    contactsSearch,
    setContactsPage,
    setContactsSearch,
    setSelectedConversation,
    setCurrentView,
  } = useChatStore();

  const { contacts, isLoading, totalPages } = useContacts(
    userId,
    contactsPage,
    contactsSearch
  );

  const handleSelectContact = (contact: any) => {
    setSelectedConversation({
      id: `temp-${contact.id}`,
      other_user: contact,
      updated_at: new Date().toISOString(),
      unread_count: 0,
    });
    setCurrentView('chat');
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Contatos</h3>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar contato..."
          value={contactsSearch}
          onChange={(e) => setContactsSearch(e.target.value)}
          className={styles.input}
        />
      </div>

      {contacts.length === 0 ? (
        <div className={styles.empty}>
          <Users size={32} />
          <p>Nenhum contato</p>
        </div>
      ) : (
        <div className={styles.list}>
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={styles.item}
            >
              <div className={styles.avatar}>
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt={contact.display_name} />
                ) : (
                  <div className={styles.placeholder}>
                    {contact.primeiro_nome?.[0]}
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <h4 className={styles.name}>{contact.display_name}</h4>
                {contact.email && (
                  <p className={styles.email}>{contact.email}</p>
                )}
              </div>
              <ChevronRight size={18} className={styles.arrow} />
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={contactsPage === 1}
            onClick={() => setContactsPage(contactsPage - 1)}
            className={styles.pageButton}
          >
            Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {contactsPage} de {totalPages}
          </span>
          <button
            disabled={contactsPage >= totalPages}
            onClick={() => setContactsPage(contactsPage + 1)}
            className={styles.pageButton}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}

export function ContactsView() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ContactsContent />
    </Suspense>
  );
}
