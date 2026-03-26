import { createSupabaseServerClient } from '@/lib/supabase/server'
import StudyCycleClient from '@/components/StudyCycleClient'

export default async function StudyCyclePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: cycles, error: cyclesError } = await supabase
    .from('cycles')
    .select(`
      id,
      discipline,
      position,
      study_color_id,
      study_colors (
        id,
        name,
        hex_value
      )
    `)
    .eq('user_id', user!.id)
    .order('position', { ascending: true })

  const { data: colors, error: colorsError } = await supabase
    .from('study_colors')
    .select('id, name, hex_value')
    .order('sort_order', { ascending: true })

  if (cyclesError || colorsError) {
    return (
      <>
        <h1>Ciclo de Estudo</h1>
        <p>Erro ao carregar os dados do ciclo.</p>
      </>
    )
  }

  return (
    <StudyCycleClient
      initialCycles={cycles ?? []}
      colors={colors ?? []}
      userId={user!.id}
    />
  )
}