module TagHelper
  # A carefully curated palette of Tailwind colors that are distinct and readable.
  # We use the 950/50 shade for background and a lighter shade for text/border.
  TAG_COLORS = [
    { bg: "bg-red-950/50", border: "border-red-800", text: "text-red-400" },
    { bg: "bg-orange-950/50", border: "border-orange-800", text: "text-orange-400" },
    { bg: "bg-amber-950/50", border: "border-amber-800", text: "text-amber-400" },
    { bg: "bg-yellow-950/50", border: "border-yellow-800", text: "text-yellow-400" },
    { bg: "bg-lime-950/50", border: "border-lime-800", text: "text-lime-400" },
    { bg: "bg-green-950/50", border: "border-green-800", text: "text-green-400" },
    { bg: "bg-emerald-950/50", border: "border-emerald-800", text: "text-emerald-400" },
    { bg: "bg-teal-950/50", border: "border-teal-800", text: "text-teal-400" },
    { bg: "bg-cyan-950/50", border: "border-cyan-800", text: "text-cyan-400" },
    { bg: "bg-sky-950/50", border: "border-sky-800", text: "text-sky-400" },
    { bg: "bg-blue-950/50", border: "border-blue-800", text: "text-blue-400" },
    { bg: "bg-indigo-950/50", border: "border-indigo-800", text: "text-indigo-400" },
    { bg: "bg-violet-950/50", border: "border-violet-800", text: "text-violet-400" },
    { bg: "bg-purple-950/50", border: "border-purple-800", text: "text-purple-400" },
    { bg: "bg-fuchsia-950/50", border: "border-fuchsia-800", text: "text-fuchsia-400" },
    { bg: "bg-pink-950/50", border: "border-pink-800", text: "text-pink-400" },
    { bg: "bg-rose-950/50", border: "border-rose-800", text: "text-rose-400" },
    { bg: "bg-slate-800", border: "border-slate-600", text: "text-slate-300" } # Fallback / Neutral
  ].freeze

  def tag_color_classes(tag)
    # Use DJB2 hash for consistency with JavaScript controller
    hash = 5381
    tag.name.each_byte do |b|
      hash = ((hash << 5) + hash) + b
    end

    index = hash.abs % TAG_COLORS.size
    colors = TAG_COLORS[index]

    # Return string of classes
    "#{colors[:bg]} #{colors[:border]} #{colors[:text]}"
  end
end
