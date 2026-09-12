"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { notificationsApi } from "@/lib/api-client";
import { getEcho } from "@/lib/echo";
import { useCurrentUser } from "./use-auth";

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: notificationsApi.list });
}

export function useUnreadNotificationCount() {
  return useQuery({ queryKey: ["notifications", "unread-count"], queryFn: notificationsApi.unreadCount });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.readAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Kullanıcının kendi Laravel bildirim kanalını (`App.Models.User.{id}`,
 * routes/channels.php'de zaten kayıtlı) dinler; yeni bir bildirim
 * geldiğinde zil rozetinin sayfa yenilemeden güncellenmesini sağlar.
 */
export function useNotificationRealtime() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const echo = getEcho();
    const channel = echo.private(`App.Models.User.${user.id}`);

    channel.notification(() => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      echo.leave(`App.Models.User.${user.id}`);
    };
  }, [user, queryClient]);
}
