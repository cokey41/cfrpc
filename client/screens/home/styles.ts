import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, Theme } from '@/constants/theme';

export const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundRoot,
    },
    header: {
      paddingTop: Spacing.xl,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.lg,
      backgroundColor: theme.backgroundDefault,
    },
    headerDesc: {
      marginTop: Spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.lg,
      paddingBottom: 100, // 为 FAB 留空间
    },
    configsList: {
      gap: Spacing.md,
    },
    configCard: {
      backgroundColor: theme.backgroundDefault,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.sm,
    },
    configName: {
      flex: 1,
      marginRight: Spacing.sm,
    },
    configDesc: {
      marginBottom: Spacing.md,
      lineHeight: 20,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: {
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    tag: {
      backgroundColor: theme.backgroundTertiary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing['5xl'],
    },
    emptyIconContainer: {
      marginBottom: Spacing.lg,
      opacity: 0.5,
    },
    emptyTitle: {
      marginBottom: Spacing.sm,
    },
    emptyDesc: {
      textAlign: 'center',
      paddingHorizontal: Spacing['2xl'],
    },
    fab: {
      position: 'absolute',
      right: Spacing.xl,
      bottom: Spacing.xl + 20, // 底部安全区
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  });
};
